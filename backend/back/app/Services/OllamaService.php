<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class OllamaService
{
    private string $host;

    private string $defaultModel;

    private int $timeout;

    private int $connectTimeout;

    private int $numPredict;

    public function __construct()
    {
        $this->host = rtrim((string) config('services.ollama.host', 'http://127.0.0.1:11434'), '/');
        $this->defaultModel = (string) config('services.ollama.model', 'qwen3:8b');
        $this->timeout = (int) config('services.ollama.timeout', 120);
        $this->connectTimeout = (int) config('services.ollama.connect_timeout', 5);
        $this->numPredict = (int) config('services.ollama.num_predict', 1024);
    }

    /**
     * @return array{reachable: bool, host: string, configured_model: string, model_installed: bool, models: list<string>, error: string|null}
     */
    public function health(): array
    {
        try {
            $models = $this->getAvailableModels();

            return [
                'reachable' => true,
                'host' => $this->host,
                'configured_model' => $this->defaultModel,
                'model_installed' => in_array($this->defaultModel, $models, true),
                'models' => $models,
                'error' => null,
            ];
        } catch (Throwable $throwable) {
            return [
                'reachable' => false,
                'host' => $this->host,
                'configured_model' => $this->defaultModel,
                'model_installed' => false,
                'models' => [],
                'error' => $throwable->getMessage(),
            ];
        }
    }

    /**
     * @return list<string>
     */
    public function getAvailableModels(): array
    {
        try {
            $response = Http::connectTimeout($this->connectTimeout)
                ->timeout(30)
                ->acceptJson()
                ->get("{$this->host}/api/tags");

            if (! $response->successful()) {
                throw new RuntimeException("Ollama tags endpoint returned HTTP {$response->status()}.");
            }

            $models = $response->json('models') ?? [];

            return array_values(array_filter(array_map(
                fn (array $model): string => (string) ($model['name'] ?? ''),
                $models,
            )));
        } catch (Throwable $throwable) {
            \Illuminate\Support\Facades\Log::warning('Failed to fetch Ollama models, using fallback. Error: ' . $throwable->getMessage());
            return [$this->defaultModel];
        }
    }

    /**
     * @param array<int, array{role: string, content: string|null}> $historyMessages
     */
    public function generateResponse(array $historyMessages, string $modelSetting = 'nova-pro'): string
    {
        $this->extendPhpTimeout();

        $availableModels = $this->getAvailableModels();
        $ollamaModel = $this->mapModelTag($modelSetting, $availableModels);

        if (! in_array($ollamaModel, $availableModels, true)) {
            throw new RuntimeException("Ollama model '{$ollamaModel}' is not installed. Run: ollama pull {$ollamaModel}");
        }

        $response = Http::connectTimeout($this->connectTimeout)
            ->timeout($this->timeout)
            ->acceptJson()
            ->post("{$this->host}/api/chat", [
                'model' => $ollamaModel,
                'messages' => $this->buildPayloadMessages($historyMessages, $modelSetting),
                'stream' => false,
                'think' => false,
                'options' => [
                    'temperature' => 0,
                    'num_ctx' => 4096,
                    'num_predict' => $this->numPredictFor($historyMessages),
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException("Ollama chat endpoint returned HTTP {$response->status()}: {$response->body()}");
        }

        $content = (string) ($response->json('message.content') ?? '');
        $content = $this->stripThinking($content);

        if ($content === '') {
            throw new RuntimeException('Ollama returned an empty assistant message.');
        }

        return $content;
    }

    /**
     * @param list<string> $availableModels
     */
    private function mapModelTag(string $modelSetting, array $availableModels): string
    {
        if ($modelSetting === 'nova-coder') {
            foreach ($availableModels as $model) {
                if (str_contains(strtolower($model), 'coder')) {
                    return $model;
                }
            }
        }

        if (in_array($this->defaultModel, $availableModels, true)) {
            return $this->defaultModel;
        }

        foreach ($availableModels as $model) {
            $normalized = strtolower($model);

            if (str_contains($normalized, 'qwen3') && str_contains($normalized, '8b')) {
                return $model;
            }
        }

        return $this->defaultModel;
    }

    /**
     * @param array<int, array{role: string, content: string|null, attachments?: array|string|null}> $historyMessages
     * @return list<array{role: string, content: string, images?: list<string>}>
     */
    private function buildPayloadMessages(array $historyMessages, string $modelSetting): array
    {
        $messages = [[
            'role' => 'system',
            'content' => $this->systemPrompt($modelSetting),
        ]];

        foreach ($historyMessages as $message) {
            $role = (string) ($message['role'] ?? 'user');
            $content = trim((string) ($message['content'] ?? ''));

            if (($content === '' && empty($message['attachments'])) || ! in_array($role, ['system', 'user', 'assistant'], true)) {
                continue;
            }

            $msgPayload = [
                'role' => $role,
                'content' => $content,
            ];

            // Decode attachments if present and base64 encode images
            if (!empty($message['attachments'])) {
                $images = [];
                $attachments = is_string($message['attachments'])
                    ? json_decode($message['attachments'], true)
                    : $message['attachments'];

                if (is_array($attachments)) {
                    foreach ($attachments as $attachment) {
                        $type = $attachment['type'] ?? '';
                        if (str_starts_with($type, 'image/')) {
                            $url = $attachment['url'] ?? '';
                            $fileName = basename(parse_url($url, PHP_URL_PATH));
                            $storagePath = 'attachments/' . $fileName;

                            if (Storage::disk('public')->exists($storagePath)) {
                                $fileContents = Storage::disk('public')->get($storagePath);
                                $images[] = base64_encode($fileContents);
                            }
                        }
                    }
                }

                if (!empty($images)) {
                    $msgPayload['images'] = $images;
                }
            }

            $messages[] = $msgPayload;
        }

        return $messages;
    }

    private function systemPrompt(string $modelSetting): string
    {
        $basePrompt = "You are NovaMind AI. Always provide complete, detailed, professional, and comprehensive responses. Never return short answers or partial code unless explicitly requested by the user.

When generating code:
- Always generate complete files, including all imports and exports.
- Include detailed comments and clear explanations.
- Never use placeholders or shorthand comments (e.g. '// rest of your code goes here').
- When asked to build a page or component, provide the full logic, CSS styling, and HTML structure.

When explaining concepts:
- Provide exhaustive explanations with step-by-step guidance.
- Include concrete examples, common use cases, and design best practices.

When asked to create a project or service (e.g., Laravel CRUD):
- Outline the full file structure.
- Generate complete database migrations, models, controllers, routes, validation request classes, and complete client integration examples.

Always prefer detailed responses over short responses.";

        if ($modelSetting === 'nova-coder') {
            return $basePrompt . "\n\nFor programming tasks, prioritize production-ready code, performance optimizations, and exact type annotations.";
        }

        return $basePrompt;
    }

    /**
     * @param array<int, array{role: string, content: string|null}> $historyMessages
     */
    private function numPredictFor(array $historyMessages): int
    {
        $lastUserMessage = '';

        foreach (array_reverse($historyMessages) as $message) {
            if (($message['role'] ?? null) === 'user') {
                $lastUserMessage = trim((string) ($message['content'] ?? ''));
                break;
            }
        }

        if ($lastUserMessage !== '' && preg_match('/^[\d\s+\-*\/().=%]+$/', $lastUserMessage)) {
            return 16;
        }

        return $this->numPredict;
    }

    private function stripThinking(string $content): string
    {
        $content = preg_replace('/<think>.*?<\/think>/is', '', $content) ?? $content;

        return trim($content);
    }

    private function extendPhpTimeout(): void
    {
        $target = (string) max($this->timeout + 10, 60);

        @ini_set('max_execution_time', $target);
        @set_time_limit((int) $target);
    }
}
