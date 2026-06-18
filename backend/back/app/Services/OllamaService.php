<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
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
        $response = Http::connectTimeout($this->connectTimeout)
            ->timeout(10)
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
     * @param array<int, array{role: string, content: string|null}> $historyMessages
     * @return list<array{role: string, content: string}>
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

            if ($content === '' || ! in_array($role, ['system', 'user', 'assistant'], true)) {
                continue;
            }

            $messages[] = [
                'role' => $role,
                'content' => $content,
            ];
        }

        return $messages;
    }

    private function systemPrompt(string $modelSetting): string
    {
        $basePrompt = 'You are NovaMind AI running locally through Ollama with Qwen3. '
            .'Answer clearly and directly. If the user asks only a simple arithmetic expression, '
            .'return only the final numeric result, with no explanation.';

        if ($modelSetting === 'nova-coder') {
            return $basePrompt.' For programming tasks, provide production-ready code and concise reasoning.';
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
