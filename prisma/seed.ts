import 'dotenv/config'
import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {

    
    const group = await prisma.eventGroup.create({
        data: {
            groupName: 'Sahur Bareng Ramadhan 1447H',
            slug: 'sahur-2026',
            lockToSingleEvent: true,
        },
    })

    const event = await prisma.event.create({
        data: {
            id: '70fecfca-2ea6-4ff0-9ec6-d114c297104a', // UUID yang Anda berikan tadi
            groupId: group.id,
            title: 'Sahur Bareng Puri Asthagina',
            slug: 'sahur-puri-asthagina',
            startAt: new Date('2026-02-06T02:00:00Z'),
            endAt: new Date('2026-02-13T04:30:00Z'),
            isActive: true,
        },
    })

    const stepClaim = await prisma.registrationStep.create({
        data: {
            eventId: event.id,
            title: 'Informasi Penghuni Kos Puri Asthagina',
            description: 'Petunjuk Pengisian Informasi : - Nama Blok : Contoh: saya tinggal di Blok CC7 Kamar No. 3. Jadi pada Nama Blok pilih "CC", pada Nomor blok isi " CC7", dan pada Nomor Kamar pilih "Kamar 3".',
            stepType: 'claim_seat',
            orderPriority: 1,
        },
    })

    await prisma.claimSeatConfig.createMany({
        data: [
            {
                stepId: stepClaim.id,
                label: 'Nama Blok Kos Yang Dihuni',
                inputType: 'select',
                options: '["AA","BB","CC","DD","EE","FF"]',
                description: ''
            },
            {
                stepId: stepClaim.id,
                label: 'Nomor Blok Kos Yang Dihuni',
                inputType: 'text',
                placeholder: 'Contoh: CC7',
                description: ''
            },
            {
                stepId: stepClaim.id,
                label: 'Nomor Kamar Yang Dihuni',
                inputType: 'select',
                options: '["Kamar 1","Kamar 2","Kamar 3","Kamar 4","Kamar 5","Kamar 6","Kamar 7","Kamar 8"]',
                description: ''
            },
        ]
    })

    const stepLandLady = await prisma.registrationStep.create({
        data: {
            eventId: event.id,
            title: 'Identitas Pemilik Kos/Pengelola Kos',
            description: 'Masukkan nama pemilik kos atau pengelola kos dengan benar.',
            stepType: 'questionnaire',
            orderPriority: 2,
        },
    })

    await prisma.questionnaireQuestion.createMany({
        data: [
            {
                stepId: stepLandLady.id,
                label: 'Nama Pemilik Kos/Pengelola Kos',
                inputType: 'text',
                isRequired: true,
                orderPriority: 1,
                description: ''
            },
            {
                stepId: stepLandLady.id,
                label: 'Nomor Telepon Pemilik Kos/Pengelola Kos',
                inputType: 'text',
                isRequired: true,
                orderPriority: 2,
                description: ''
            },
        ],
    })

    const stepOrigin = await prisma.registrationStep.create({
        data: {
            eventId: event.id,
            title: 'Informasi Asal Penghuni Kos',
            description: 'Masukkan nama pemilik kos atau pengelola kos dengan benar.',
            stepType: 'questionnaire',
            orderPriority: 3,
        },
    })

    await prisma.questionnaireQuestion.createMany({
        data: [
            {
                stepId: stepOrigin.id,
                label: 'Provinsi',
                inputType: 'text',
                isRequired: true,
                orderPriority: 1,
                description: ''
            },
            {
                stepId: stepOrigin.id,
                label: 'Kota/Kabupaten',
                inputType: 'text',
                isRequired: true,
                orderPriority: 2,
                description: ''
            },
            {
                stepId: stepOrigin.id,
                label: 'Alamat',
                description: 'Masukan alamat lengkap berupa kecamatan, kelurahan, nama jalan, dan sebagainya.',
                inputType: 'text',
                isRequired: true,
                orderPriority: 3,
            },
            {
                stepId: stepOrigin.id,
                label: 'Nama Universitas/Perguruan Tinggi/Tempat Kerja',
                description: 'Masukan nama universitas atau perguruan tinggi. Jika tidak sedang dalam pendidikan silahkan isi nama tempat bekerja.',
                inputType: 'text',
                isRequired: true,
                orderPriority: 4,
            },
        ],
    })

    const stepReview = await prisma.registrationStep.create({
        data: {
            eventId: event.id,
            title: 'Bantu Kami Dengan Memberikan Rating, Review & Follow',
            description: 'Petunjuk Pengisian : Berikan rating dan review di Google Maps Puri Asthagina (link di bawah ini) dan follow akun Instagram, Tiktok, serta subscribe channel Youtube Puri Asthagina. Cantumkan bukti review, follow, dan subscribe dalam bentuk screenshoot pada form yang tersedia.',
            stepType: 'questionnaire',
            orderPriority: 4,
        },
    })

    await prisma.questionnaireQuestion.createMany({
        data: [
            {
                stepId: stepReview.id,
                label: 'Bukti Rating & Review Google Maps Puri Asthagina',
                inputType: 'file',
                isRequired: true,
                orderPriority: 1,
                description: ''
            },
            {
                stepId: stepReview.id,
                label: 'Bukti Follow Instagram',
                inputType: 'file',
                isRequired: true,
                orderPriority: 2,
                description: ''
            },
            {
                stepId: stepReview.id,
                label: 'Bukti Follow Tiktok',
                inputType: 'file',
                isRequired: true,
                orderPriority: 3,
                description: ''
            },
            {
                stepId: stepReview.id,
                label: 'Bukti Subscribe Channel Youtube',
                inputType: 'file',
                isRequired: true,
                orderPriority: 4,
                description: ''
            },
            {
                stepId: stepReview.id,
                label: 'Bukti Follow Instagram',
                inputType: 'file',
                isRequired: true,
                orderPriority: 5,
                description: ''
            },
            {
                stepId: stepReview.id,
                label: 'Bukti Follow Tiktok',
                inputType: 'file',
                isRequired: true,
                orderPriority: 6,
                description: ''
            },
            {
                stepId: stepReview.id,
                label: 'Bukti Subscribe Channel Youtube',
                inputType: 'file',
                isRequired: true,
                orderPriority: 7,
                description: ''
            },
        ],
    })

    console.log('Seed data created successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })