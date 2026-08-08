<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class GeminiService
{
    private string $apiKey;
    private string $model;
    private string $fallbackModel;
    private int $timeout;
    private string $systemInstruction;

    public function __construct()
    {
        $this->apiKey = (string) (config('services.gemini.api_key') ?: env('GEMINI_API_KEY', ''));
        $this->model = (string) (config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-flash-latest'));
        $this->fallbackModel = (string) (config('services.gemini.fallback_model') ?: env('GEMINI_FALLBACK_MODEL', 'gemini-3.5-flash'));
        $this->timeout = (int) (config('services.gemini.timeout') ?: (int) env('GEMINI_TIMEOUT', 30));
        $this->systemInstruction = (string) config('services.gemini.system_instruction', '');
    }

    /**
     * Generate response for a single message prompt with retries & model fallback.
     */
    public function generateResponse(string $message, ?string $customSystemInstruction = null): string
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('Gemini API key is not configured.');
        }

        $systemInstruction = $customSystemInstruction ?? $this->systemInstruction;

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $message]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'topP' => 0.95,
                'maxOutputTokens' => 2048,
            ],
        ];

        if (!empty($systemInstruction)) {
            $payload['systemInstruction'] = [
                'parts' => [
                    ['text' => $systemInstruction]
                ]
            ];
        }

        return $this->executeApiCallWithRetryAndFallback($payload);
    }

    /**
     * Generate response from full conversation history with retries & model fallback.
     */
    public function generateResponseFromHistory(array $historyMessages, ?string $customSystemInstruction = null): string
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('Gemini API key is not configured.');
        }

        $contents = [];

        foreach ($historyMessages as $msg) {
            $role = ($msg['role'] ?? 'user') === 'assistant'
                ? 'model'
                : 'user';

            $content = trim((string) ($msg['content'] ?? ''));
            $parts = [];

            if ($content !== '') {
                $parts[] = ['text' => $content];
            }

            if (!empty($msg['attachments']) && is_array($msg['attachments'])) {
                foreach ($msg['attachments'] as $att) {
                    $mime = $att['type'] ?? '';
                    $url = $att['url'] ?? '';
                    if (str_starts_with($mime, 'image/') && !empty($url)) {
                        $relativePath = ltrim(parse_url($url, PHP_URL_PATH) ?? '', '/');
                        
                        // Check public path & storage path
                        $fullPath = public_path($relativePath);
                        if (!file_exists($fullPath)) {
                            $storageRelative = str_replace('storage/', '', $relativePath);
                            $fullPath = storage_path('app/public/' . $storageRelative);
                        }

                        if (file_exists($fullPath)) {
                            $fileBytes = @file_get_contents($fullPath);
                            if ($fileBytes !== false) {
                                $base64 = base64_encode($fileBytes);
                                $parts[] = [
                                    'inlineData' => [
                                        'mimeType' => $mime,
                                        'data' => $base64,
                                    ]
                                ];
                            }
                        }
                    }
                }
            }

            if (empty($parts)) {
                continue;
            }

            $contents[] = [
                'role' => $role,
                'parts' => $parts,
            ];
        }

        if (empty($contents)) {
            throw new RuntimeException('No valid conversation messages found to send to AI.');
        }

        $systemInstruction = $customSystemInstruction ?? $this->systemInstruction;

        $payload = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'topP' => 0.95,
                'maxOutputTokens' => 2048,
            ],
        ];

        if (!empty($systemInstruction)) {
            $payload['systemInstruction'] = [
                'parts' => [
                    ['text' => $systemInstruction]
                ]
            ];
        }

        return $this->executeApiCallWithRetryAndFallback($payload);
    }

    /**
     * Sanitizes error messages to prevent exposing API keys in logs or exceptions.
     */
    private function sanitizeErrorMessage(string $message): string
    {
        return preg_replace('/key=[a-zA-Z0-9_\-\.]+/i', 'key=[REDACTED]', $message);
    }

    /**
     * Executes the Gemini API call with Exponential Backoff Retries & Model Fallback.
     * Retries on HTTP 429, 500, 502, 503, 504 and network/connection timeouts.
     */
    private function executeApiCallWithRetryAndFallback(array $payload): string
    {
        @set_time_limit(60);
        $modelsToTry = array_values(array_unique(array_filter([
            $this->model,
            $this->fallbackModel,
            'gemini-flash-latest',
            'gemini-3.5-flash',
            'gemini-3.6-flash',
            'gemini-3.1-flash-lite',
            'gemini-flash-lite-latest',
        ])));

        $delays = [0, 1];
        $retryableStatusCodes = [500, 502, 503, 504, 0];
        $rateLimitHit = false;
        $lastErrorMessage = '';

        foreach ($modelsToTry as $currentModel) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$currentModel}:generateContent?key={$this->apiKey}";

            foreach ($delays as $attemptIndex => $delaySeconds) {
                $attemptNumber = $attemptIndex + 1;

                if ($delaySeconds > 0) {
                    Log::info("Gemini API Retrying automatically in {$delaySeconds}s (Attempt {$attemptNumber}/" . count($delays) . " for model '{$currentModel}')...");
                    sleep($delaySeconds);
                }

                $startTime = microtime(true);
                $statusCode = 0;
                $errorMessage = '';

                try {
                    $response = Http::withoutVerifying()
                        ->timeout($this->timeout)
                        ->acceptJson()
                        ->post($url, $payload);

                    $durationMs = round((microtime(true) - $startTime) * 1000, 2);
                    $statusCode = $response->status();

                    if ($response->successful()) {
                        $text = data_get($response->json(), 'candidates.0.content.parts.0.text');
                        if ($text) {
                            Log::info("Gemini API Call Succeeded", [
                                'timestamp' => now()->toIso8601String(),
                                'model' => $currentModel,
                                'attempt' => $attemptNumber,
                                'status_code' => $statusCode,
                                'duration_ms' => $durationMs,
                            ]);
                            return trim($text);
                        }
                        $errorMessage = 'Empty response content received from Gemini API.';
                    } else {
                        $rawError = data_get($response->json(), 'error.message') ?? "HTTP {$statusCode} Error: " . $response->body();
                        $errorMessage = $this->sanitizeErrorMessage($rawError);
                    }
                } catch (Throwable $e) {
                    $durationMs = round((microtime(true) - $startTime) * 1000, 2);
                    $errorMessage = $this->sanitizeErrorMessage($e->getMessage());
                }

                $lastErrorMessage = $errorMessage;
                if ($statusCode === 429 || str_contains(strtolower($errorMessage), 'quota') || str_contains(strtolower($errorMessage), 'rate limit')) {
                    $rateLimitHit = true;
                }

                Log::warning("Gemini API Attempt Failed", [
                    'timestamp' => now()->toIso8601String(),
                    'model' => $currentModel,
                    'attempt' => $attemptNumber,
                    'status_code' => $statusCode,
                    'error' => $errorMessage,
                    'duration_ms' => $durationMs,
                ]);

                if ($statusCode === 429 || $statusCode === 404) {
                    break;
                }

                if (!in_array($statusCode, $retryableStatusCodes, true)) {
                    break;
                }
            }

            if ($currentModel !== end($modelsToTry)) {
                Log::warning("Gemini Model '{$currentModel}' failed. Switching to Next Model...");
            }
        }

        if ($rateLimitHit || str_contains(strtolower($lastErrorMessage), 'quota') || str_contains(strtolower($lastErrorMessage), 'rate limit')) {
            throw new RuntimeException("Gemini API Daily Quota Exceeded (Free tier limit reached). Please update GEMINI_API_KEY in backend environment settings.");
        }

        throw new RuntimeException("AI Service Error: " . ($lastErrorMessage ?: "Unable to reach Gemini AI API."));
    }

    public function health(): array
    {
        return [
            'reachable' => true,
            'host' => 'https://generativelanguage.googleapis.com',
            'configured_model' => $this->model,
            'fallback_model' => $this->fallbackModel,
            'configured' => !empty($this->apiKey),
        ];
    }
}