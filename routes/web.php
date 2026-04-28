<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\OperatorController as AdminOperatorController;
use App\Http\Controllers\Operator\DashboardController as OperatorDashboardController;
use App\Http\Controllers\Operator\EntryController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/rekap', [AdminController::class, 'rekap'])->name('rekap');
    Route::get('/chart-data', [AdminController::class, 'getChartData'])->name('chart-data');
    
    Route::resource('operators', AdminOperatorController::class);
    Route::post('operators/{operator}/reset-password', [AdminOperatorController::class, 'resetPassword'])->name('operators.reset-password');
});

Route::middleware(['auth', 'role:operator'])->prefix('operator')->name('operator.')->group(function () {
    Route::get('/dashboard', [OperatorDashboardController::class, 'index'])->name('dashboard');
    Route::get('/rekap', [OperatorDashboardController::class, 'rekap'])->name('rekap');
    Route::get('/chart-data', [AdminController::class, 'getChartData'])->name('chart-data');
    
    Route::get('/entries', [EntryController::class, 'index'])->name('entries.index');
    Route::get('/entries/table-data', [EntryController::class, 'getTableData'])->name('entries.table-data');
    Route::post('/entries/kapal', [EntryController::class, 'store'])->name('entries.store');
    Route::patch('/entries/{entry}', [EntryController::class, 'update'])->name('entries.update');
    Route::delete('/entries/{entry}', [EntryController::class, 'destroy'])->name('entries.destroy');
    Route::post('/entries/submit-drafts', [EntryController::class, 'submitDrafts'])->name('entries.submit-drafts');
    Route::get('/entries/submitted-data', [EntryController::class, 'submittedData'])->name('entries.submitted-data');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
