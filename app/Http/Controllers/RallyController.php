<?php

namespace App\Http\Controllers;

use App\Models\Rally;
use App\Http\Requests\StoreRallyRequest;
use App\Http\Requests\UpdateRallyRequest;

class RallyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreRallyRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreRallyRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Rally  $rally
     * @return \Illuminate\Http\Response
     */
    public function show(Rally $rally)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Rally  $rally
     * @return \Illuminate\Http\Response
     */
    public function edit(Rally $rally)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateRallyRequest  $request
     * @param  \App\Models\Rally  $rally
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateRallyRequest $request, Rally $rally)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Rally  $rally
     * @return \Illuminate\Http\Response
     */
    public function destroy(Rally $rally)
    {
        //
    }
}
