<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$key = config('services.gemini.api_key');

$model = 'gemini-2.5-flash';
echo "=== Testing model: $model ===\n";
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $key;

$res = Illuminate\Support\Facades\Http::withoutVerifying()->post($url, [
    'contents' => [
        [
            'parts' => [
                ['text' => 'Hello! Say I am working in 3 words.']
            ]
        ]
    ]
]);

echo "STATUS: " . $res->status() . "\n";
if ($res->successful()) {
    echo "SUCCESS: " . data_get($res->json(), 'candidates.0.content.parts.0.text') . "\n\n";
} else {
    echo "ERROR: " . $res->json('error.message') . "\n\n";
}
