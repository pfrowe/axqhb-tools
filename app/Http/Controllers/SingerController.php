<?php

namespace App\Http\Controllers;

use App\Models\Singer;
use App\Http\Requests\StoreSingerRequest;
use App\Http\Requests\UpdateSingerRequest;

class SingerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(StoreSingerRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Singer $singer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Singer $singer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSingerRequest $request, Singer $singer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Singer $singer)
    {
        //
    }
}
