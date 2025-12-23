import { useState, useMemo } from "react"; // ✅ useMemo add kiya
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Bus as BusIcon, Clock, MapPin, Search } from "lucide-react";

const busSchedule = [
  {
    id: 1,
    route: "Shahdol to Rewa",
    time: "08:30 AM",
    type: "Express",
    status: "On Time",
  },
  {
    id: 2,
    route: "Shahdol to Anuppur",
    time: "09:15 AM",
    type: "Local",
    status: "On Time",
  },
  {
    id: 3,
    route: "Shahdol to Jabalpur",
    time: "10:00 AM",
    type: "AC Sleeper",
    status: "Delayed (10m)",
  },
  {
    id: 4,
    route: "Shahdol to Umaria",
    time: "11:45 AM",
    type: "Local",
    status: "On Time",
  },
  {
    id: 5,
    route: "Shahdol to Kotma",
    time: "01:20 PM",
    type: "Express",
    status: "On Time",
  },
  {
    id: 6,
    route: "Shahdol to Beohari",
    time: "02:45 PM",
    type: "Local",
    status: "On Time",
  },
];

export default function Bus() {
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Improvement 1 & 3: useMemo for performance + Time Sorting
  const sortedAndFilteredBuses = useMemo(() => {
    const filtered = busSchedule.filter((bus) =>
      bus.route.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Time ke basis par sort karna (Simple localeCompare for AM/PM logic)
    return [...filtered].sort((a, b) => a.time.localeCompare(b.time));
  }, [searchTerm]);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-4xl animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BusIcon className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-slate-900">Bus Timetable</h1>
        </div>

        {/* 🔍 Search Input with Accessibility */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            aria-label="Search bus routes" // ✅ Improvement 2: Accessibility
            placeholder="Search destination (e.g. Rewa)..."
            className="pl-10 border-slate-200 focus:ring-orange-500 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-700 font-bold">
            <Clock className="h-5 w-5 text-orange-500" />
            Shahdol Departures
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold">Route</TableHead>
                  <TableHead className="font-bold">Time</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="text-right font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredBuses.length > 0 ? (
                  sortedAndFilteredBuses.map((bus) => (
                    <TableRow
                      key={bus.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-orange-400" />
                          {bus.route}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-600">
                        {bus.time}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {bus.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-xs font-black ${
                            bus.status.includes("Delayed")
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {bus.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-slate-400 font-medium"
                    >
                      No buses found for "{searchTerm}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Note */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
        <span className="text-blue-500 font-bold text-lg">ⓘ</span>
        <p className="text-sm text-blue-800 leading-relaxed">
          Timings are based on local bus union schedules. Please verify at the
          counter for last-minute changes.
        </p>
      </div>
    </div>
  );
}
