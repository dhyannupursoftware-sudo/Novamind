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
    private int $timeout;
    private string $systemInstruction;

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.api_key', '');
        $this->model = (string) config('services.gemini.model', 'gemini-2.5-flash');
        $this->timeout = (int) config('services.gemini.timeout', 30);
        $this->systemInstruction = (string) config('services.gemini.system_instruction', '');
    }

    public function generateResponse(string $message, ?string $customSystemInstruction = null): string
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('Gemini API key is not configured.');
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        $systemInstruction = $customSystemInstruction ?? $this->systemInstruction;

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $message
                        ]
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

        try {

            $response = Http::withoutVerifying()
                ->timeout($this->timeout)
                ->acceptJson()
                ->post($url, $payload);

            Log::info('Gemini Response', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

        } catch (Throwable $e) {

            Log::error('Gemini Error', [
                'message' => $e->getMessage()
            ]);

            throw new RuntimeException(
                "Network error while connecting to Gemini API: ".$e->getMessage()
            );
        }

        if (!$response->successful()) {

            $error = $response->json('error.message') ?? $response->body();

            throw new RuntimeException(
                "Gemini API Error ({$response->status()}): ".$error
            );
        }

        $text = data_get(
            $response->json(),
            'candidates.0.content.parts.0.text'
        );

        if (!$text) {
            throw new RuntimeException('Gemini returned an empty response.');
        }

        return trim($text);
    }

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

            $content = trim((string)($msg['content'] ?? ''));
            $parts = [];

            if ($content !== '') {
                $parts[] = ['text' => $content];
            }

            if (!empty($msg['attachments']) && is_array($msg['attachments'])) {
                foreach ($msg['attachments'] as $att) {
                    $mime = $att['type'] ?? '';
                    $url = $att['url'] ?? '';
                    if (str_starts_with($mime, 'image/') && !empty($url)) {
                        // Check if file exists locally in public path or fetch data
                        $relativePath = ltrim(parse_url($url, PHP_URL_PATH) ?? '', '/');
                        $fullPath = public_path($relativePath);
                        if (file_exists($fullPath)) {
                            $base64 = base64_encode(file_get_contents($fullPath));
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

            if (empty($parts)) {
                continue;
            }

            $contents[] = [
                'role' => $role,
                'parts' => $parts,
            ];
        }

        if (empty($contents)) {
            throw new RuntimeException('No messages found.');
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

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

        try {
            $response = Http::withoutVerifying()
                ->timeout($this->timeout)
                ->acceptJson()
                ->post($url, $payload);

            Log::info('Gemini Chat History Response', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

        } catch (Throwable $e) {

            Log::error('Gemini Chat History Error', [
                'message' => $e->getMessage()
            ]);

            throw new RuntimeException(
                "Network error while connecting to Gemini API: ".$e->getMessage()
            );
        }

        if (!$response->successful()) {

            $error = $response->json('error.message') ?? $response->body();

            throw new RuntimeException(
                "Gemini API Error ({$response->status()}): ".$error
            );
        }

        $text = data_get(
            $response->json(),
            'candidates.0.content.parts.0.text'
        );

        if (!$text) {
            throw new RuntimeException('Gemini returned an empty response.');
        }

        return trim($text);
    }

    public function health(): array
    {
        return [
            'reachable' => true,
            'host' => 'https://generativelanguage.googleapis.com',
            'configured_model' => $this->model,
            'configured' => !empty($this->apiKey),
        ];
    }
}