<?php

namespace Database\Seeders;

use App\Models\Komoditas;
use Illuminate\Database\Seeder;

class KomoditasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            ['nama' => 'LPG', 'slug' => 'lpg'],
            ['nama' => 'LNG', 'slug' => 'lng'],
            ['nama' => 'PUPUK', 'slug' => 'pupuk'],
            ['nama' => 'AMMONIA', 'slug' => 'ammonia'],
            ['nama' => 'AMMONIUM NITRATE', 'slug' => 'ammonium-nitrate'],
        ];

        foreach ($data as $item) {
            Komoditas::create($item);
        }
    }
}
