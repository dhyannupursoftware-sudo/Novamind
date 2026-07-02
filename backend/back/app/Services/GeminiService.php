<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class GeminiService
{
    private string $apiKey;
    private string $model;
    private int $timeout;

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.key', '');
        $this->model = (string) config('services.gemini.model', 'gemini-1.5-flash');
        $this->timeout = (int) config('services.gemini.timeout', 30);
    }

    /**
     * Send a single message (or prompt) to the Gemini API and return the response text.
     *
     * @param string $message The user's input message.
     * @return string The generated AI response.
     * @throws RuntimeException If the request fails or key is invalid.
     */
    public function generateResponse(string $message): string
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        try {
            $response = Http::timeout($this->timeout)
                ->acceptJson()
                ->post($url, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $message]
                            ]
                        ]
                    ]
                ]);
        } catch (Throwable $e) {
            throw new RuntimeException("Network error while connecting to Gemini API: {$e->getMessage()}", 0, $e);
        }

        if ($response->status() === 400 || $response->status() === 403) {
            $errorMsg = $response->json('error.message') ?? 'Invalid API key or unauthorized request.';
            throw new RuntimeException("Gemini API authentication failed: {$errorMsg}");
        }

        if (!$response->successful()) {
            $errorMsg = $response->json('error.message') ?? $response->body();
            throw new RuntimeException("Gemini API error (HTTP {$response->status()}): {$errorMsg}");
        }

        $body = $response->json();
        $text = data_get($body, 'candidates.0.content.parts.0.text');

        if (empty($text)) {
            $finishReason = data_get($body, 'candidates.0.finishReason');
            if ($finishReason === 'SAFETY') {
                throw new RuntimeException('Gemini response was blocked by safety settings.');
            }
            throw new RuntimeException('Gemini API returned an empty response.');
        }

        return trim($text);
    }
}
