"use client"
// Reference:
// https://ui.shadcn.com/blocks/sidebar
import * as React from "react"
import {
    GalleryVerticalEnd,
    Github,
    LayoutDashboard,
    MessageSquareWarning,
    Video,
    Voicemail
} from "lucide-react"

import Link from "next/link"

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { usePathname } from "next/navigation"


export const navData = {
    navMain: [
        {
            title: "Issues",
            icon: MessageSquareWarning,
            url: "/issues",
            isActive: true,
            items: [
                {
                    title: "Multi-Part Interviews",
                    url: "/issues/multiPart",
                    isActive: false,
                },
                {
                    title: "Multi-Combined Audio Files",
                    url: "/issues/multiCombinedAudio",
                    isActive: false,
                },
                {
                    title: "Unlabelled Audio",
                    url: "/issues/unlabelledAudio",
                    isActive: false,
                },
                {
                    title: "Missing Interviews",
                    url: "/issues/missing",
                    isActive: false,
                },
                {
                    title: "Missing Runsheets",
                    url: "/issues/noRunsheet",
                    isActive: false,
                },
                {
                    title: "Missing Transcripts",
                    url: "/issues/noTranscript",
                    isActive: false,
                },
                {
                    title: "Failed Audio QC",
                    url: "/issues/audioQcFailed",
                    isActive: false,
                },
                {
                    title: "Pending Transcription Push",
                    url: "/issues/pendingTranscriptionPush",
                    isActive: false,
                },
                {
                    title: "Awaiting Vendor Transcription",
                    url: "/issues/awaitingVendorTranscription",
                    isActive: false,
                },
                {
                    title: "Transcript Not Imported",
                    url: "/issues/transcriptNotImported",
                    isActive: false,
                },
                {
                    title: "Pipeline Failures",
                    url: "/issues/pipelineFailures",
                    isActive: false,
                },
                {
                    title: "Runsheet Match",
                    url: "/issues/runsheetMatch",
                    isActive: false,
                },
            ],
        },
        {
            title: "Interviews",
            icon: Video,
            url: "/interviews",
            isActive: true,
            items: [
                {
                    title: "Pending QC",
                    url: "/interviews/qc/pending",
                    isActive: false,
                },
                {
                    title: "Completed QC",
                    url: "/interviews/qc/completed",
                    isActive: false,
                },
            ],
        },
        {
            title: "Audio Journals",
            icon: Voicemail,
            url: "/journals",
            items: [],
        },
    ],
    navSecondary: [
        {
            title: "GitHub",
            url: "https://github.com/dheshanm/dpinterview-web",
            icon: Github,
        },
        {
            title: "Superset",
            url: "http://localhost:8088",
            icon: LayoutDashboard,
        },
    ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const pathname = usePathname()

    function setActive(items: any[]) {
        return items.map(item => {
            const isActive = pathname === item.url || (item.items && item.items.some((sub: any) => pathname === sub.url))
            const newItem = { ...item, isActive }
            if (item.items && item.items.length > 0) {
                newItem.items = setActive(item.items)
            }
            return newItem
        })
    }

    const navDataWithActive = {
        navMain: setActive(navData.navMain),
        navSecondary: setActive(navData.navSecondary),
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <GalleryVerticalEnd className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">AV QC Portal</span>
                                    <span className="">v0.2.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navDataWithActive.navMain} />
                <NavSecondary items={navDataWithActive.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
