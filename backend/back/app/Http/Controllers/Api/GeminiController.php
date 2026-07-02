<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Throwable;

class GeminiController extends Controller
{
    protected GeminiService $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    /**
     * Handle incoming chat requests, forward to Gemini API and return response.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        try {
            $userMessage = $request->input('message');
            $aiResponse = $this->gemini->generateResponse($userMessage);

            return response()->json([
                'response' => $aiResponse,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'error' => 'Gemini API Error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
