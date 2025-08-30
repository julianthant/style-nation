'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  IconCircleCheckFilled, 
  IconDotsVertical, 
  IconLoader,
  IconPlus,
  IconDownload,
  IconFilter,
  IconSearch,
  IconClock,
  IconAlertCircle
} from '@tabler/icons-react';
import { Eye, Mail, Phone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { DataTable } from '@/components/common/data-table';
import { StatsCards } from '@/components/common/stats-cards';
import { ChartAreaInteractive } from '@/components/common/chart-area-interactive';

import { ColumnDef } from '@tanstack/react-table';

// Sample inquiry data schema
export const inquirySchema = z.object({
  id: z.string(),
  customerName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  carMake: z.string(),
  carModel: z.string(),
  carYear: z.number(),
  message: z.string(),
  status: z.enum(['NEW', 'CONTACTED', 'CLOSED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  createdAt: z.string(),
  respondedAt: z.string().optional(),
});

type InquiryTableData = z.infer<typeof inquirySchema>;

// Sample inquiry data
const sampleInquiries: InquiryTableData[] = [
  {
    id: '1',
    customerName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    carMake: 'Toyota',
    carModel: 'Camry',
    carYear: 2023,
    message: 'I\'m interested in this vehicle. What\'s the best price you can offer?',
    status: 'NEW',
    priority: 'HIGH',
    createdAt: '2024-08-29T10:30:00Z',
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    carMake: 'Honda',
    carModel: 'Accord',
    carYear: 2022,
    message: 'Can I schedule a test drive for this weekend?',
    status: 'CONTACTED',
    priority: 'MEDIUM',
    createdAt: '2024-08-29T09:15:00Z',
    respondedAt: '2024-08-29T11:45:00Z',
  },
  {
    id: '3',
    customerName: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '+1 (555) 987-6543',
    carMake: 'BMW',
    carModel: '3 Series',
    carYear: 2024,
    message: 'Does this car come with a warranty? What financing options are available?',
    status: 'NEW',
    priority: 'MEDIUM',
    createdAt: '2024-08-29T08:45:00Z',
  },
  {
    id: '4',
    customerName: 'Lisa Wilson',
    email: 'lisa.wilson@email.com',
    carMake: 'Audi',
    carModel: 'A4',
    carYear: 2023,
    message: 'I saw this car online and would like more information about its features.',
    status: 'CLOSED',
    priority: 'LOW',
    createdAt: '2024-08-28T16:20:00Z',
    respondedAt: '2024-08-28T17:30:00Z',
  },
  {
    id: '5',
    customerName: 'Robert Brown',
    email: 'rob.brown@email.com',
    phone: '+1 (555) 456-7890',
    carMake: 'Mercedes',
    carModel: 'C-Class',
    carYear: 2023,
    message: 'Is this vehicle still available? I\'m ready to make an offer.',
    status: 'NEW',
    priority: 'HIGH',
    createdAt: '2024-08-28T14:10:00Z',
  }
];

export default function InquiriesPage() {
  const [selectedInquiries, setSelectedInquiries] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Sample stats data
  const statsData = {
    totalRevenue: 127, // Total inquiries
    newCustomers: sampleInquiries.filter(i => i.status === 'NEW').length,
    activeAccounts: sampleInquiries.filter(i => i.status === 'CONTACTED').length,
    growthRate: 85.4 // Response rate
  };

  // Sample chart data for inquiry trends
  const inquiryTrendsData = [
    { date: "2024-08-25", cars: 15, inquiries: 8 },
    { date: "2024-08-26", cars: 12, inquiries: 12 },
    { date: "2024-08-27", cars: 18, inquiries: 15 },
    { date: "2024-08-28", cars: 9, inquiries: 6 },
    { date: "2024-08-29", cars: 22, inquiries: 18 },
  ];

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      // Implement delete logic here
      toast.success('Inquiry deleted successfully!');
    }
  };

  const handleUpdateStatus = async (inquiryId: string, status: 'NEW' | 'CONTACTED' | 'CLOSED') => {
    // Implement status update logic here
    toast.success(`Inquiry status updated to ${status.toLowerCase()}`);
  };

  // Inquiry table columns definition
  const columns: ColumnDef<InquiryTableData>[] = [
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const inquiry = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">{inquiry.customerName}</div>
            <div className="text-xs text-muted-foreground">{inquiry.email}</div>
            {inquiry.phone && (
              <div className="text-xs text-muted-foreground">{inquiry.phone}</div>
            )}
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => {
        const inquiry = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">
              {inquiry.carYear} {inquiry.carMake} {inquiry.carModel}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-sm" title={row.original.message}>
          {row.original.message}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {status === "NEW" ? (
              <IconAlertCircle className="fill-red-500 dark:fill-red-400 w-3 h-3 mr-1" />
            ) : status === "CONTACTED" ? (
              <IconClock className="fill-orange-500 dark:fill-orange-400 w-3 h-3 mr-1" />
            ) : (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 w-3 h-3 mr-1" />
            )}
            {status === 'NEW' ? 'New' : status === 'CONTACTED' ? 'In Progress' : 'Completed'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority;
        const colorClass = priority === 'HIGH' ? 'text-red-600' : 
                          priority === 'MEDIUM' ? 'text-orange-600' : 'text-green-600';
        return (
          <Badge variant="outline" className={`px-1.5 ${colorClass}`}>
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created",
      header: "Received",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleUpdateStatus(row.original.id, 'CONTACTED')}>
              <Eye className="mr-2 w-4 h-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateStatus(row.original.id, 'CONTACTED')}>
              <Mail className="mr-2 w-4 h-4" />
              Send Email
            </DropdownMenuItem>
            {row.original.phone && (
              <DropdownMenuItem>
                <Phone className="mr-2 w-4 h-4" />
                Call Customer
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Mark as Contacted
            </DropdownMenuItem>
            <DropdownMenuItem>
              Mark as Closed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => handleDeleteInquiry(row.original.id)}
            >
              <Trash2 className="mr-2 w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  // Bulk actions
  const handleBulkAction = async (action: 'contacted' | 'closed' | 'delete') => {
    if (selectedInquiries.length === 0) return;

    const confirmMessage = `Are you sure you want to ${action} ${selectedInquiries.length} selected inquiries?`;
    if (!confirm(confirmMessage)) return;

    // Implement bulk action logic here
    toast.success(`${selectedInquiries.length} inquiries ${action === 'delete' ? 'deleted' : `marked as ${action}`} successfully!`);
    setSelectedInquiries([]);
  };

  // Toolbar component
  const toolbar = (
    <div className="flex sm:flex-row flex-col justify-between gap-4">
      <div className="flex flex-1 gap-2 max-w-md">
        <div className="relative flex-1">
          <IconSearch className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
          <Input
            placeholder="Search inquiries by customer, email, or vehicle..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <IconFilter className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        {selectedInquiries.length > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('contacted')}
            >
              Mark as Contacted
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('closed')}
            >
              Mark as Closed
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('delete')}
            >
              Delete Selected
            </Button>
          </>
        )}
        <Button variant="outline" size="sm">
          <IconDownload className="mr-2 w-4 h-4" />
          Export
        </Button>
      </div>
    </div>
  );

  // Transform stats for StatsCards component
  const transformedStats = {
    totalRevenue: statsData.totalRevenue,
    newCustomers: statsData.newCustomers,
    activeAccounts: statsData.activeAccounts, 
    growthRate: statsData.growthRate
  };

  return (
    <div className="@container/main space-y-6">
      {/* Stats Cards */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        <StatsCards stats={{
          totalRevenue: 127,
          newCustomers: sampleInquiries.filter(i => i.status === 'NEW').length,
          activeAccounts: sampleInquiries.filter(i => i.status === 'CONTACTED').length,
          growthRate: 85.4
        }} />
      </div>

      {/* Inquiry Trends Chart */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive 
          title="Inquiry Trends"
          description="Daily inquiries and response activity"
          data={inquiryTrendsData}
          config={{
            visitors: {
              label: "Inquiry Activity",
            },
            cars: {
              label: "New Inquiries",
              color: "var(--primary)",
            },
            inquiries: {
              label: "Responses Sent",
              color: "hsl(var(--primary) / 0.7)",
            },
          }}
        />
      </div>

      {/* Inquiries Table */}
      <DataTable
        columns={columns}
        data={sampleInquiries}
        getRowId={(row) => row.id}
        toolbar={toolbar}
        tabs={[
          {
            value: "all",
            label: "All Inquiries",
            badge: sampleInquiries.length,
          },
          {
            value: "new",
            label: "New",
            badge: sampleInquiries.filter(i => i.status === 'NEW').length,
          },
          {
            value: "in-progress",
            label: "In Progress",
            badge: sampleInquiries.filter(i => i.status === 'CONTACTED').length,
          },
          {
            value: "completed",
            label: "Completed",
            badge: sampleInquiries.filter(i => i.status === 'CLOSED').length,
          },
        ]}
      />
    </div>
  );
}