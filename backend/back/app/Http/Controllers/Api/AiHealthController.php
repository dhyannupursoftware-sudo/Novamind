<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OllamaService;
use Illuminate\Http\JsonResponse;

class AiHealthController extends Controller
{
    public function __invoke(OllamaService $ollama): JsonResponse
    {
        $health = $ollama->health();

        return response()->json($health, $health['reachable'] ? 200 : 503);
    }
}
