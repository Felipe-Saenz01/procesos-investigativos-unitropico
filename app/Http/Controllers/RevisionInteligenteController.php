<?php

namespace App\Http\Controllers;

use App\Models\RevisionInteligente;
use Illuminate\Http\Request;

class RevisionInteligenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return redirect()->route('dashboard');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(RevisionInteligente $revisionInteligente)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RevisionInteligente $revisionInteligente)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RevisionInteligente $revisionInteligente)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RevisionInteligente $revisionInteligente)
    {
        //
    }
}
