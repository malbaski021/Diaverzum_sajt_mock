import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllEvents } from "@/lib/events";
import EventsSearch from "@/components/EventsSearch";

export const metadata: Metadata = {
  title: "Događaji",
  description: "Događaji i aktivnosti udruženja Diaverzum Novi Sad.",
};

export default function DogadjajiPage() {
  const allEvents = getAllEvents();

  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">Događaji</li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-gray-900">Događaji</h1>
            <p className="text-gray-500 mt-2">Aktivnosti i događaji udruženja</p>
          </div>
        </div>

        <Suspense>
          <EventsSearch events={allEvents} />
        </Suspense>
      </div>
    </div>
  );
}
