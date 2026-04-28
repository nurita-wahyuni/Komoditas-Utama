<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Komoditas extends Model
{
    protected $table = 'komoditas';
    protected $fillable = ['nama', 'slug'];

    public function dataEntries()
    {
        return $this->hasMany(DataEntry::class);
    }
}
