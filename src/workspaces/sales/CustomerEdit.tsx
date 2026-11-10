import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import CustomerForm from './CustomerForm';

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, updateCustomer, showToast } = useStore();
  const customer = customers.find(c => c.id === id);
  if (!customer) return <div className="p-8 text-center text-sm text-[var(--text-2)]">Customer not found.</div>;
  return <CustomerForm customer={customer} title={`Edit Customer · ${customer.tradingName}`} onCancel={() => navigate('/sales?tab=customers')} onSave={patch => { updateCustomer(customer.id, patch); showToast({ type: 'success', title: 'Customer updated', body: `${patch.tradingName || customer.tradingName} has been updated.` }); navigate(`/sales/customers/${customer.id}`); }} />;
}
