import { Tenant, Payment, MaintenanceRequest, Listing } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  getTenants: async (): Promise<Tenant[]> => {
    const response = await fetch(`${API_URL}/tenants/`);
    if (!response.ok) throw new Error('Failed to fetch tenants');
    const data = await response.json();
    // Map backend fields to frontend types if necessary (e.g. snake_case to camelCase)
    // Django Rest Framework defaults to snake_case, but our types are camelCase.
    // We need to map them or configure DRF to use camelCase.
    // For now, let's map manually to be safe and explicit.
    return data.map((item: any) => ({
      ...item,
      propertyUnit: item.property_unit,
      leaseStart: item.lease_start,
      leaseEnd: item.lease_end,
      rentAmount: parseFloat(item.rent_amount),
      deposit: parseFloat(item.deposit),
      balance: parseFloat(item.balance),
      creditScore: item.credit_score,
      backgroundCheckStatus: item.background_check_status,
      applicationData: item.application_data,
      leaseStatus: item.lease_status,
      signedLeaseUrl: item.signed_lease_url
    }));
  },

  getPayments: async (): Promise<Payment[]> => {
    const response = await fetch(`${API_URL}/payments/`);
    if (!response.ok) throw new Error('Failed to fetch payments');
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      tenantId: item.tenant, // DRF returns ID by default for ForeignKey
      amount: parseFloat(item.amount)
    }));
  },

  getMaintenanceRequests: async (): Promise<MaintenanceRequest[]> => {
    const response = await fetch(`${API_URL}/maintenance/`);
    if (!response.ok) throw new Error('Failed to fetch maintenance requests');
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      tenantId: item.tenant,
      createdAt: item.created_at,
      completionAttachments: item.completion_attachments
    }));
  },

  getListings: async (): Promise<Listing[]> => {
    const response = await fetch(`${API_URL}/listings/`);
    if (!response.ok) throw new Error('Failed to fetch listings');
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      price: parseFloat(item.price),
      baths: parseFloat(item.baths)
    }));
  }
};
