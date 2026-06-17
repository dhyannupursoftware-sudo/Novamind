<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class OllamaService
{
    protected string $host;
    protected int $timeout;

    public function __construct()
    {
        $this->host = rtrim(config('services.ollama.host', env('OLLAMA_HOST', 'http://127.0.0.1:11434')), '/');
        $this->timeout = (int) config('services.ollama.timeout', 45); // 45 seconds timeout
    }

    /**
     * Get system prompt based on user settings model or context
     */
    protected function getSystemPrompt(string $model): string
    {
        $basePrompt = "You are NovaMind AI, an advanced developer and system assistant. " .
                      "You are running locally on Qwen3/Qwen2.5 architectures. " .
                      "Respond using clean GitHub Flavored Markdown. When providing code blocks, always specify the language for proper syntax highlighting. ";

        if ($model === 'nova-coder') {
            return $basePrompt . "You are in Programming Specialist mode. Provide production-ready, highly optimized code across React, Laravel, PHP, JavaScript, TypeScript, MySQL, HTML, and CSS. Highlight best practices, security, and edge-case handling. Keep explanations concise.";
        }

        return $basePrompt . "Be helpful, friendly, and provide clear explanations. If code is requested, provide it cleanly.";
    }

    /**
     * Map frontend user model settings to Ollama pulled model tag
     */
    protected function mapModelTag(string $modelSetting): string
    {
        // Default to qwen3/qwen (e.g. qwen:8b or qwen2.5:7b)
        // If the user specifies Qwen3:8b, the pulled tag on ollama is typically 'qwen:8b' or 'qwen2.5:7b' or 'qwen'
        // We will default to 'qwen:8b' or user model if they configured it directly.
        if ($modelSetting === 'nova-coder') {
            return 'qwen2.5-coder:7b';
        }
        return 'qwen:8b'; // default general Qwen 8B
    }

    /**
     * Send chat request to local Ollama API
     *
     * @param array $historyMessages Array of models containing role and content
     * @param string $modelSetting User settings model tag
     * @return string AI Response content
     */
    public function generateResponse(array $historyMessages, string $modelSetting = 'nova-pro'): string
    {
        $ollamaModel = $this->mapModelTag($modelSetting);
        $systemPrompt = $this->getSystemPrompt($modelSetting);

        // Compile messages payload
        $payloadMessages = [];
        $payloadMessages[] = [
            'role' => 'system',
            'content' => $systemPrompt,
        ];

        foreach ($historyMessages as $msg) {
            $payloadMessages[] = [
                'role' => $msg['role'],
                'content' => $msg['content'] ?? '',
            ];
        }

        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->host}/api/chat", [
                    'model' => $ollamaModel,
                    'messages' => $payloadMessages,
                    'stream' => false,
                ]);

            if ($response->successful()) {
                return $response->json('message.content') ?? 'No response content generated.';
            }

            Log::warning("Ollama API returned non-success response: " . $response->body());
            return $this->getOfflineFallback($ollamaModel, "HTTP Code: " . $response->status());

        } catch (Exception $e) {
            Log::error("Failed to connect to local Ollama API: " . $e->getMessage());
            return $this->getOfflineFallback($ollamaModel, $e->getMessage());
        }
    }

    /**
     * Return helpful simulator guide reply when local Ollama is offline or model is missing
     */
    protected function getOfflineFallback(string $modelTag, string $errorDetails): string
    {
        return "### ⚠️ NovaMind AI Sandbox Simulator (Local Ollama Offline)\n\n" .
               "I tried to contact your local Ollama API at `{$this->host}`, but the service appears to be offline or the model is loading.\n\n" .
               "**Technical Error Details**:\n" .
               "> `{$errorDetails}`\n\n" .
               "--- \n\n" .
               "#### 🚀 How to Set Up & Run Local Qwen3 AI:\n\n" .
               "1. **Install Ollama**:\n" .
               "   - Download and run the installer from the official site: [Ollama.com](https://ollama.com)\n\n" .
               "2. **Pull the Qwen Model**:\n" .
               "   - Open your terminal and pull the Qwen 8B model:\n" .
               "     ```bash\n" .
               "     ollama pull {$modelTag}\n" .
               "     ```\n\n" .
               "3. **Start the Service**:\n" .
               "   - Ensure the server is listening locally on port `11434`:\n" .
               "     ```bash\n" .
               "     ollama serve\n" .
               "     ```\n\n" .
               "Once the local Ollama server is active, NovaMind will automatically route prompts through your Qwen model!";
    }
}
