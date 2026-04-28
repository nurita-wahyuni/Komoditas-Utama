<script setup>
import BpsLayout from '@/Layouts/BpsLayout.vue';
import DeleteUserForm from './Partials/DeleteUserForm.vue';
import UpdatePasswordForm from './Partials/UpdatePasswordForm.vue';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm.vue';
import { Head } from '@inertiajs/vue3';

defineProps({
    mustVerifyEmail: {
        type: Boolean,
    },
    status: {
        type: String,
    },
});
</script>

<template>
    <Head title="Profile" />

    <BpsLayout>
        <div class="max-w-7xl mx-auto">
            <div class="mb-10">
                <h1 class="text-3xl font-black text-gray-900 tracking-tight">Pengaturan Profil</h1>
                <p class="text-gray-500 mt-1 font-medium">Kelola informasi akun dan keamanan Anda</p>
            </div>

            <div class="space-y-8">
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <UpdateProfileInformationForm
                        :must-verify-email="mustVerifyEmail"
                        :status="status"
                        class="max-w-xl"
                    />
                </div>

                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <UpdatePasswordForm class="max-w-xl" />
                </div>

                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <DeleteUserForm class="max-w-xl" />
                </div>
            </div>
        </div>
    </BpsLayout>
</template>
