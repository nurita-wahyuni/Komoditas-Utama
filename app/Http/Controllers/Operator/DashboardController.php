<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\DataEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\KategoriKapal;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $year = $request->get('tahun', date('Y'));
        
        $summary = [
            'total_entries' => DataEntry::where('user_id', $user->id)->where('tahun', $year)->where('status', 'submitted')->count(),
            'total_bongkar' => DataEntry::where('user_id', $user->id)
                ->where('tahun', $year)
                ->where('status', 'submitted')
                ->whereHas('jenisKegiatan', fn($q) => $q->where('slug', 'bongkar'))
                ->sum('jumlah_massa'),
            'total_muat' => DataEntry::where('user_id', $user->id)
                ->where('tahun', $year)
                ->where('status', 'submitted')
                ->whereHas('jenisKegiatan', fn($q) => $q->where('slug', 'muat'))
                ->sum('jumlah_massa'),
            'active_operators' => 1, // Personal data only, so it's just the current user
        ];

        return Inertia::render('Operator/Dashboard', [
            'summary' => $summary,
            'filters' => [
                'tahun' => $year,
            ]
        ]);
    }

    public function rekap(Request $request)
    {
        $user = Auth::user();
        $year = $request->get('tahun', date('Y'));
        $month = $request->get('bulan', date('n'));
        $kategoriSlug = $request->get('kategori', 'luar-negeri');

        $kategori = KategoriKapal::where('slug', $kategoriSlug)->firstOrFail();

        $query = DataEntry::where('user_id', $user->id)
            ->where('tahun', $year)
            ->where('bulan', $month)
            ->where('kategori_kapal_id', $kategori->id)
            ->where('status', 'submitted');

        $total_unit = (clone $query)->count();
        $total_bongkar = (clone $query)->whereHas('jenisKegiatan', fn($q) => $q->where('slug', 'bongkar'))->sum('jumlah_massa');
        $total_muat = (clone $query)->whereHas('jenisKegiatan', fn($q) => $q->where('slug', 'muat'))->sum('jumlah_massa');

        $bongkar_data = DB::table('data_entries')
            ->join('komoditas', 'data_entries.komoditas_id', '=', 'komoditas.id')
            ->join('jenis_kegiatan', 'data_entries.jenis_kegiatan_id', '=', 'jenis_kegiatan.id')
            ->where('data_entries.user_id', $user->id)
            ->where('data_entries.tahun', $year)
            ->where('data_entries.bulan', $month)
            ->where('data_entries.kategori_kapal_id', $kategori->id)
            ->where('data_entries.status', 'submitted')
            ->where('jenis_kegiatan.slug', 'bongkar')
            ->select('komoditas.nama as komoditas', DB::raw('SUM(jumlah_massa) as volume'), 'satuan')
            ->groupBy('komoditas.id', 'komoditas.nama', 'satuan')
            ->get();

        $muat_data = DB::table('data_entries')
            ->join('komoditas', 'data_entries.komoditas_id', '=', 'komoditas.id')
            ->join('jenis_kegiatan', 'data_entries.jenis_kegiatan_id', '=', 'jenis_kegiatan.id')
            ->where('data_entries.user_id', $user->id)
            ->where('data_entries.tahun', $year)
            ->where('data_entries.bulan', $month)
            ->where('data_entries.kategori_kapal_id', $kategori->id)
            ->where('data_entries.status', 'submitted')
            ->where('jenis_kegiatan.slug', 'muat')
            ->select('komoditas.nama as komoditas', DB::raw('SUM(jumlah_massa) as volume'), 'satuan')
            ->groupBy('komoditas.id', 'komoditas.nama', 'satuan')
            ->get();

        return Inertia::render('Operator/Rekap', [
            'summary' => [
                'total_unit' => $total_unit,
                'total_bongkar' => (float)$total_bongkar,
                'total_muat' => (float)$total_muat,
            ],
            'bongkar_data' => $bongkar_data,
            'muat_data' => $muat_data,
            'filters' => [
                'tahun' => (int)$year,
                'bulan' => (int)$month,
                'kategori' => $kategoriSlug,
            ],
            'kategori_kapal' => KategoriKapal::all(),
        ]);
    }
}
