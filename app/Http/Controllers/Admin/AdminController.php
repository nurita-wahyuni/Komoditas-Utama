<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DataEntry;
use App\Models\User;
use App\Models\KategoriKapal;
use App\Models\Komoditas;
use App\Models\JenisKegiatan;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $year = $request->get('tahun', date('Y'));
        
        $summary = [
            'total_entries' => DataEntry::where('tahun', $year)->where('status', 'submitted')->count(),
            'total_bongkar' => DataEntry::where('tahun', $year)
                ->where('status', 'submitted')
                ->whereHas('jenisKegiatan', fn($q) => $q->where('slug', 'bongkar'))
                ->sum('jumlah_massa'),
            'total_muat' => DataEntry::where('tahun', $year)
                ->where('status', 'submitted')
                ->whereHas('jenisKegiatan', fn($q) => $q->where('slug', 'muat'))
                ->sum('jumlah_massa'),
            'active_operators' => User::where('role', 'operator')->where('is_active', true)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'summary' => $summary,
            'filters' => [
                'tahun' => $year,
            ]
        ]);
    }

    public function rekap(Request $request)
    {
        $year = $request->get('tahun', date('Y'));
        $month = $request->get('bulan', date('n'));
        $kategoriSlug = $request->get('kategori', 'luar-negeri');

        $kategori = KategoriKapal::where('slug', $kategoriSlug)->firstOrFail();

        $query = DataEntry::where('tahun', $year)
            ->where('bulan', $month)
            ->where('kategori_kapal_id', $kategori->id);

        $total_unit = (clone $query)->count();
        $total_bongkar = (clone $query)->whereHas('jenisKegiatan', fn($q) => $q->where('slug', 'bongkar'))->sum('jumlah_massa');
        $total_muat = (clone $query)->whereHas('jenisKegiatan', fn($q) => $q->where('slug', 'muat'))->sum('jumlah_massa');

        $bongkar_data = DB::table('data_entries')
            ->join('komoditas', 'data_entries.komoditas_id', '=', 'komoditas.id')
            ->join('jenis_kegiatan', 'data_entries.jenis_kegiatan_id', '=', 'jenis_kegiatan.id')
            ->where('data_entries.tahun', $year)
            ->where('data_entries.bulan', $month)
            ->where('data_entries.kategori_kapal_id', $kategori->id)
            ->where('jenis_kegiatan.slug', 'bongkar')
            ->select('komoditas.nama as komoditas', DB::raw('SUM(jumlah_massa) as volume'), 'satuan')
            ->groupBy('komoditas.id', 'komoditas.nama', 'satuan')
            ->get();

        $muat_data = DB::table('data_entries')
            ->join('komoditas', 'data_entries.komoditas_id', '=', 'komoditas.id')
            ->join('jenis_kegiatan', 'data_entries.jenis_kegiatan_id', '=', 'jenis_kegiatan.id')
            ->where('data_entries.tahun', $year)
            ->where('data_entries.bulan', $month)
            ->where('data_entries.kategori_kapal_id', $kategori->id)
            ->where('jenis_kegiatan.slug', 'muat')
            ->select('komoditas.nama as komoditas', DB::raw('SUM(jumlah_massa) as volume'), 'satuan')
            ->groupBy('komoditas.id', 'komoditas.nama', 'satuan')
            ->get();

        return Inertia::render('Admin/Rekap', [
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

    public function getChartData(Request $request)
    {
        $tahun = $request->get('tahun', date('Y'));
        $user = $request->user();
        $months = range(1, 12);
        
        $komoditas = Komoditas::all();
        
        $getData = function($kategoriSlugs, $jenisSlug) use ($tahun, $months, $user, $komoditas) {
            $result = [];
            
            foreach ($komoditas as $k) {
                $query = DataEntry::whereHas('kategoriKapal', fn($q) => $q->whereIn('slug', (array)$kategoriSlugs))
                    ->whereHas('jenisKegiatan', fn($q) => $q->where('slug', $jenisSlug))
                    ->where('komoditas_id', $k->id)
                    ->where('tahun', $tahun)
                    ->where('status', 'submitted');

                if ($user->role === 'operator') {
                    $query->where('user_id', $user->id);
                }

                $data = $query->selectRaw('bulan, SUM(jumlah_massa) as total')
                    ->groupBy('bulan')
                    ->pluck('total', 'bulan')
                    ->toArray();

                $result[] = [
                    'label' => $k->nama,
                    'slug' => $k->slug,
                    'data' => array_map(fn($m) => (float)($data[$m] ?? 0), $months)
                ];
            }
            
            return $result;
        };

        return response()->json([
            'bongkar' => [
                'luar_negeri' => $getData('luar-negeri', 'bongkar'),
                'dalam_negeri' => $getData(['dalam-negeri', 'perintis', 'rakyat'], 'bongkar'),
            ],
            'muat' => [
                'luar_negeri' => $getData('luar-negeri', 'muat'),
                'dalam_negeri' => $getData(['dalam-negeri', 'perintis', 'rakyat'], 'muat'),
            ]
        ]);
    }
}
