import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import type { Party } from '../../types';
import CustomerForm from './CustomerForm';

export default function CustomerCreate() {
  const navigate = useNavigate();
  const { addCustomer, showToast } = useStore();
  const initial: Party = { id: `cust-new-${Date.now()}`, partyType: 'Customer', legalName: '', tradingName: '', panNumber: '', gstin: '', state: '', paymentTerms: 'Net 30', creditLimit: 0, currency: 'INR', status: 'active', contactPerson: '', phone: '', email: '', city: '', since: '2026' };
  return <CustomerForm customer={initial} title="Add New Customer" onCancel={() => navigate('/sales/customers')} onSave={patch => { addCustomer({ ...initial, ...patch }); showToast({ type: 'success', title: 'Customer added', body: `${patch.tradingName || patch.legalName} has been registered.` }); navigate('/sales/customers'); }} />;
}
