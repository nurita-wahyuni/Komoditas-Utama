<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class OperatorController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Operators/Index', [
            'operators' => User::where('role', 'operator')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'operator',
            'is_active' => true,
        ]);

        return back();
    }

    public function update(Request $request, User $operator)
    {
        $request->validate([
            'username' => 'required|string|unique:users,username,' . $operator->id,
            'email' => 'required|email|unique:users,email,' . $operator->id,
            'is_active' => 'required|boolean',
        ]);

        $operator->update($request->only('username', 'email', 'is_active'));

        return back();
    }

    public function resetPassword(Request $request, User $operator)
    {
        $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $operator->update([
            'password' => Hash::make($request->password),
        ]);

        return back();
    }

    public function destroy(User $operator)
    {
        $operator->delete();
        return back();
    }
}
