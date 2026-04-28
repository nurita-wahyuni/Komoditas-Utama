<script setup>
import BpsLayout from '@/Layouts/BpsLayout.vue';
import { Head, router } from '@inertiajs/vue3';
import { ref, watch, computed } from 'vue';

const props = defineProps({
    summary: Object,
    bongkar_data: Array,
    muat_data: Array,
    filters: Object,
    kategori_kapal: Array,
});

const selectedYear = ref(props.filters.tahun);
const selectedMonth = ref(props.filters.bulan);
const selectedKategori = ref(props.filters.kategori);

const months = [
    { id: 1, nama: 'Januari' }, { id: 2, nama: 'Februari' }, { id: 3, nama: 'Maret' },
    { id: 4, nama: 'April' }, { id: 5, nama: 'Mei' }, { id: 6, nama: 'Juni' },
    { id: 7, nama: 'Juli' }, { id: 8, nama: 'Agustus' }, { id: 9, nama: 'September' },
    { id: 10, nama: 'Oktober' }, { id: 11, nama: 'November' }, { id: 12, nama: 'Desember' }
];

const selectedMonthName = computed(() => {
    return months.find(m => m.id === selectedMonth.value)?.nama || '';
});

const updateFilters = () => {
    router.get(route('operator.rekap'), {
        tahun: selectedYear.value,
        bulan: selectedMonth.value,
        kategori: selectedKategori.value
    }, { preserveState: true });
};

watch([selectedYear, selectedMonth, selectedKategori], () => {
    updateFilters();
});

const setKategori = (slug) => {
    selectedKategori.value = slug;
};
</script>

<template>
    <Head title="Rekap Laporan Saya" />

    <BpsLayout>
        <div class="flex justify-between items-start mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">Rekap Laporan Saya</h1>
                <p class="text-gray-500 mt-1">Laporan pribadi per kategori periode {{ selectedMonthName }} {{ selectedYear }}</p>
            </div>
        </div>

        <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <!-- Filter Bar -->
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 space-y-4 md:space-y-0">
                <!-- Category Tabs -->
                <div class="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
                    <button 
                        v-for="kat in kategori_kapal" 
                        :key="kat.id"
                        @click="setKategori(kat.slug)"
                        :class="[
                            selectedKategori === kat.slug 
                                ? 'bg-white text-blue-700 shadow-md font-bold' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                            'px-5 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center group'
                        ]"
                    >
                        <div :class="[
                            'mr-2.5 p-1.5 rounded-lg transition-colors group-hover:scale-110 duration-200',
                            selectedKategori === kat.slug ? 'bg-blue-50 text-blue-600' : 'bg-gray-200/50 text-gray-400'
                        ]">
                            <svg v-if="kat.slug === 'luar-negeri'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <svg v-else-if="kat.slug === 'dalam-negeri'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <svg v-else-if="kat.slug === 'perintis'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <span>{{ kat.nama }}</span>
                    </button>
                </div>

                <!-- Select Filters -->
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <select v-model="selectedMonth" class="appearance-none bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm pr-12">
                            <option v-for="m in months" :key="m.id" :value="m.id">{{ m.nama }}</option>
                        </select>
                        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div class="relative">
                        <select v-model="selectedYear" class="appearance-none bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm pr-12">
                            <option v-for="y in [2023, 2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
                        </select>
                        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div class="bg-blue-50 p-8 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <p class="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Total Unit Saya</p>
                    <h3 class="text-4xl font-extrabold text-blue-900">{{ summary?.total_unit || 0 }}</h3>
                </div>
                <div class="bg-indigo-50 p-8 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Total Bongkar Saya</p>
                    <h3 class="text-4xl font-extrabold text-indigo-900">{{ (summary?.total_bongkar || 0).toLocaleString() }}</h3>
                </div>
                <div class="bg-purple-50 p-8 rounded-2xl border border-purple-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <p class="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Total Muat Saya</p>
                    <h3 class="text-4xl font-extrabold text-purple-900">{{ (summary?.total_muat || 0).toLocaleString() }}</h3>
                </div>
            </div>

            <!-- Tables Container -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <!-- Bongkar Table -->
                <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h4 class="font-bold text-blue-800">Kegiatan Bongkar Saya</h4>
                        <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Inbound</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-white">
                                <tr>
                                    <th class="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Komoditas</th>
                                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Volume</th>
                                    <th class="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Satuan</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                <tr v-for="item in bongkar_data || []" :key="item.komoditas" class="hover:bg-blue-50 transition-colors">
                                    <td class="px-6 py-4 text-sm font-semibold text-gray-700">{{ item.komoditas }}</td>
                                    <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">{{ Number(item.volume || 0).toLocaleString() }}</td>
                                    <td class="px-6 py-4 text-sm text-gray-500 text-right">{{ item.satuan }}</td>
                                </tr>
                                <tr v-if="!bongkar_data || bongkar_data.length === 0">
                                    <td colspan="3" class="px-6 py-8 text-center text-gray-400 text-sm">Tidak ada data bongkar pribadi.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Muat Table -->
                <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h4 class="font-bold text-emerald-800">Kegiatan Muat Saya</h4>
                        <span class="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Outbound</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-white">
                                <tr>
                                    <th class="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Komoditas</th>
                                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Volume</th>
                                    <th class="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Satuan</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                <tr v-for="item in muat_data || []" :key="item.komoditas" class="hover:bg-emerald-50 transition-colors">
                                    <td class="px-6 py-4 text-sm font-semibold text-gray-700">{{ item.komoditas }}</td>
                                    <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">{{ Number(item.volume || 0).toLocaleString() }}</td>
                                    <td class="px-6 py-4 text-sm text-gray-500 text-right">{{ item.satuan }}</td>
                                </tr>
                                <tr v-if="!muat_data || muat_data.length === 0">
                                    <td colspan="3" class="px-6 py-8 text-center text-gray-400 text-sm">Tidak ada data muat pribadi.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </BpsLayout>
</template>

<style scoped>
select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.75rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
}
</style>
