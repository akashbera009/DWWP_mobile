export interface Transaction {
  id: string;
  date: string;
  type: 'addon' | 'regular';
  amount: number;
  qty: number;
  status: 'completed' | 'pending';
}

export const TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-1001',
    date: '2026-03-01',
    type: 'regular',
    amount: 150,
    qty: 1,
    status: 'completed',
  },
  {
    id: 'TXN-1002',
    date: '2026-03-02',
    type: 'addon',
    amount: 50,
    qty: 2,
    status: 'completed',
  },
  {
    id: 'TXN-1003',
    date: '2026-03-03',
    type: 'regular',
    amount: 100,
    qty: 1,
    status: 'pending',
  },
  {
    id: 'TXN-1003',
    date: '2026-03-03',
    type: 'regular',
    amount: 100,
    qty: 1,
    status: 'pending',
  },
  {
    id: 'TXN-1003',
    date: '2026-03-03',
    type: 'regular',
    amount: 100,
    qty: 1,
    status: 'pending',
  },
];