// Add these imports to the top of js/api.js
import { db } from './db.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Update the function like this:
const getMembers = async () => {
    if (CONFIG.USE_MOCK) return delay([...MOCK.members]); 
    
    // Live Firestore call
    const querySnapshot = await getDocs(collection(db, "members"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// =============================================================================
// js/api.js  —  Dream Development DD · v2 API Layer
// =============================================================================
// ENDPOINT CONTRACT (backend must match these):
//
//  POST  /auth/admin-login                  → { token, user }
//  POST  /auth/member-login                 → { token, member }
//  POST  /auth/register                     → { success }          (member 1st-time)
//  POST  /auth/logout                       → { success }
//
//  GET   /members                           → member[]             [admin]
//  GET   /members/:id                       → member               [auth]
//  POST  /members                           → member               [admin]
//  PUT   /members/:id                       → member               [admin]
//  DELETE /members/:id                      → { success }          [admin]
//  POST  /members/:id/send-id-email         → { success }          [admin]
//
//  GET   /applications                      → application[]        [admin]
//  GET   /applications/:id                  → application          [admin]
//  POST  /applications                      → application          (public)
//  POST  /applications/:id/approve          → { member }           [admin]
//  POST  /applications/:id/reject           → application          [admin]
//
//  GET   /board-of-founders                 → member[]
//  PUT   /board-of-founders                 → member[]             [admin]
//
//  GET   /executive-committee               → member[]
//  PUT   /executive-committee               → member[]             [admin]
//
//  GET   /notices?page&limit                → { data[], totalPages }
//  GET   /notices/all                       → notice[]             [admin]
//  POST  /notices                           → notice               [admin]
//  PUT   /notices/:id                       → notice               [admin]
//  DELETE /notices/:id                      → { success }          [admin]
//
//  GET   /gallery?page&limit                → { data[], totalPages }
//
//  GET   /nominee-requests                  → request[]            [admin]
//  POST  /nominee-requests                  → request              [auth]
//  POST  /nominee-requests/:id/:action      → request              [admin]
//
//  GET   /members/:id/invoices?page         → { data[], total }    [auth]
// =============================================================================

const API = (() => {

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Auth.getToken()}`,
  });

  const request = async (endpoint, options = {}) => {
    const res = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  };

  const delay = (data) =>
    new Promise((r) => setTimeout(() => r(structuredClone(data)), CONFIG.MOCK_DELAY_MS));

  // ── MOCK DATA STORE ────────────────────────────────────────────────────────────

  const MOCK = {

    // ── Members (extended model) ───────────────────────────────────────────────
    members: [
      {
        id: 'm1', memberId: 'DD-001', role: 'admin', status: 'active',
        name: 'Md. Rahim Uddin',       fatherName: 'Md. Karim Uddin',        motherName: 'Rahima Begum',
        dob: '1985-03-15',             nidNumber: '1234567890123',           occupation: 'Business',
        phone: '+8801700000011',       email: 'rahim@demo.com',
        presentAddress : { house: 'House 12, Road 5', area: 'Dhanmondi',  city: 'Dhaka',   postCode: '1209' },
        permanentAddress: { village: 'Uddinpur',      upazila: 'Savar',   district: 'Dhaka', postCode: '1340' },
        photo: 'https://i.pravatar.cc/200?img=11', nidPhoto: null, signaturePhoto: null,
        nominee: { name: 'Fatema Uddin',   relationship: 'Wife',    nidNumber: '9876543210987', phone: '+8801700000099', photo: null, nidPhoto: null },
        joinDate: '2020-06-01', password: null,
      },
      {
        id: 'm2', memberId: 'DD-002', role: 'member', status: 'active',
        name: 'Karim Hossain',          fatherName: 'Md. Jalal Hossain',     motherName: 'Amena Begum',
        dob: '1988-07-22',             nidNumber: '1234567890124',           occupation: 'Engineer',
        phone: '+8801700000012',       email: 'karim@demo.com',
        presentAddress : { house: 'Flat 3A, Block C', area: 'Mirpur-10',  city: 'Dhaka',   postCode: '1216' },
        permanentAddress: { village: 'Char Fasson',   upazila: 'Bhola Sadar', district: 'Bhola', postCode: '8300' },
        photo: 'https://i.pravatar.cc/200?img=12', nidPhoto: null, signaturePhoto: null,
        nominee: { name: 'Rima Hossain',   relationship: 'Wife',    nidNumber: '9876543210988', phone: '+8801700000100', photo: null, nidPhoto: null },
        joinDate: '2020-06-01', password: null,
      },
      {
        id: 'm3', memberId: 'DD-003', role: 'member', status: 'active',
        name: 'Nasrin Akter',           fatherName: 'Md. Nurul Islam',       motherName: 'Hosne Ara Begum',
        dob: '1990-11-08',             nidNumber: '1234567890125',           occupation: 'Teacher',
        phone: '+8801700000013',       email: 'nasrin@demo.com',
        presentAddress : { house: 'House 7, Lane 3', area: 'Uttara Sector 9', city: 'Dhaka', postCode: '1230' },
        permanentAddress: { village: 'Kaliganj',     upazila: 'Kaliganj',  district: 'Gazipur', postCode: '1750' },
        photo: 'https://i.pravatar.cc/200?img=9',  nidPhoto: null, signaturePhoto: null,
        nominee: { name: 'Belal Akter',    relationship: 'Husband', nidNumber: '9876543210989', phone: '+8801700000101', photo: null, nidPhoto: null },
        joinDate: '2020-06-01', password: null,
      },
      {
        id: 'm4', memberId: 'DD-004', role: 'member', status: 'active',
        name: 'Farhan Ahmed',           fatherName: 'Md. Salim Ahmed',       motherName: 'Kulsum Begum',
        dob: '1992-04-17',             nidNumber: '1234567890126',           occupation: 'IT Professional',
        phone: '+8801700000014',       email: 'farhan@demo.com',
        presentAddress : { house: 'Road 12, Block B', area: 'Bashundhara R/A', city: 'Dhaka', postCode: '1229' },
        permanentAddress: { village: 'Barisal Sadar', upazila: 'Barisal Sadar', district: 'Barisal', postCode: '8200' },
        photo: 'https://i.pravatar.cc/200?img=15', nidPhoto: null, signaturePhoto: null,
        nominee: { name: 'Sara Ahmed',     relationship: 'Wife',    nidNumber: '9876543210990', phone: '+8801700000102', photo: null, nidPhoto: null },
        joinDate: '2021-01-15', password: null,
      },
      {
        id: 'm5', memberId: 'DD-005', role: 'member', status: 'active',
        name: 'Tania Sultana',          fatherName: 'Md. Habib Sultana',     motherName: 'Parveen Sultana',
        dob: '1991-09-30',             nidNumber: '1234567890127',           occupation: 'Businesswoman',
        phone: '+8801700000015',       email: 'tania@demo.com',
        presentAddress : { house: 'House 45', area: 'Gulshan-1', city: 'Dhaka', postCode: '1212' },
        permanentAddress: { village: 'Netrokona Sadar', upazila: 'Netrokona Sadar', district: 'Netrokona', postCode: '2400' },
        photo: 'https://i.pravatar.cc/200?img=25', nidPhoto: null, signaturePhoto: null,
        nominee: { name: 'Milon Sultana', relationship: 'Brother', nidNumber: '9876543210991', phone: '+8801700000103', photo: null, nidPhoto: null },
        joinDate: '2021-03-10', password: null,
      },
      {
        id: 'm6', memberId: 'DD-006', role: 'member', status: 'active',
        name: 'Rafiq Islam',            fatherName: 'Md. Sadek Islam',       motherName: 'Rabeya Begum',
        dob: '1987-12-05',             nidNumber: '1234567890128',           occupation: 'Doctor',
        phone: '+8801700000016',       email: 'rafiq@demo.com',
        presentAddress : { house: 'Flat 5C, Tower 3', area: 'Banani',    city: 'Dhaka', postCode: '1213' },
        permanentAddress: { village: 'Mymensing Sadar', upazila: 'Mymensing Sadar', district: 'Mymensing', postCode: '2200' },
        photo: 'https://i.pravatar.cc/200?img=16', nidPhoto: null, signaturePhoto: null,
        nominee: { name: 'Sonia Islam',    relationship: 'Wife',    nidNumber: '9876543210992', phone: '+8801700000104', photo: null, nidPhoto: null },
        joinDate: '2021-06-20', password: null,
      },
    ],

    // ── Board of Founders ─────────────────────────────────────────────────────
    boardOfFounders: [
      { id:'bof1', name:'Md. Rahim Uddin',  position:'Chairman & Founder',  photo:'https://i.pravatar.cc/200?img=11', termStart:'2020-06-01', termEnd:null,   message:'We started Dream Development with a single belief: that ordinary people, united by trust, can build extraordinary futures. This organisation is our collective dream made real.',          order:1 },
      { id:'bof2', name:'Karim Hossain',    position:'Co-Founder',          photo:'https://i.pravatar.cc/200?img=12', termStart:'2020-06-01', termEnd:null,   message:'Founding this group was the best financial decision I have ever made — not just for the returns, but for the brotherhood and accountability it has given us.',                          order:2 },
      { id:'bof3', name:'Nasrin Akter',     position:'Co-Founder & Advisor', photo:'https://i.pravatar.cc/200?img=9', termStart:'2020-06-01', termEnd:null,   message:'As a founding member, I am proud that we built an institution on ethics before earnings. Our values are our strongest asset.',                                                        order:3 },
      { id:'bof4', name:'Farhan Ahmed',     position:'Founding Member',      photo:'https://i.pravatar.cc/200?img=15', termStart:'2020-06-01', termEnd:null,  message:'Every rupee we invest here is a step toward the futures our families deserve. I am honoured to have planted this seed.',                                                                    order:4 },
    ],

    // ── Executive Committee ───────────────────────────────────────────────────
    executiveCommittee: [
      { id:'ec1', name:'Md. Rahim Uddin',  position:'President',           photo:'https://i.pravatar.cc/200?img=11', termStart:'2026-04-23', termEnd:'2028-04-23', message:'The 2026–2028 term carries the weight of our greatest ambitions. I am committed to prudent stewardship and democratic governance.',  order:1 },
      { id:'ec2', name:'Tania Sultana',    position:'Vice President',      photo:'https://i.pravatar.cc/200?img=25', termStart:'2026-04-23', termEnd:'2028-04-23', message:'Transparency and equal voice are not ideals — they are our operating procedures. I will hold the committee accountable to both.',   order:2 },
      { id:'ec3', name:'Karim Hossain',    position:'General Secretary',   photo:'https://i.pravatar.cc/200?img=12', termStart:'2026-04-23', termEnd:'2028-04-23', message:'My role is to ensure that every member\'s concern reaches the table and every decision is communicated clearly.',                       order:3 },
      { id:'ec4', name:'Nasrin Akter',     position:'Treasurer',           photo:'https://i.pravatar.cc/200?img=9',  termStart:'2026-04-23', termEnd:'2028-04-23', message:'Every taka is accounted for. Financial integrity is the foundation this community stands on.',                                          order:4 },
      { id:'ec5', name:'Farhan Ahmed',     position:'Joint Secretary',     photo:'https://i.pravatar.cc/200?img=15', termStart:'2026-04-23', termEnd:'2028-04-23', message:'I am here to bridge the gap between leadership and members — listening first, acting second.',                                           order:5 },
      { id:'ec6', name:'Rafiq Islam',      position:'Organising Secretary', photo:'https://i.pravatar.cc/200?img=16', termStart:'2026-04-23', termEnd:'2028-04-23', message:'Great organisations are built on great events and stronger community. I will ensure we stay connected and engaged.',                    order:6 },
    ],

    // ── Notices ────────────────────────────────────────────────────────────────
    notices: [
      { id:'n1', title:'Monthly Contribution Reminder — July 2026',  body:'This is a reminder that monthly contributions of BDT 5,000 are due by July 25, 2026. Please ensure timely submission to avoid late charges.',  category:'Finance',      author:'Admin', published:true,  createdAt:'2026-07-01T10:00:00Z' },
      { id:'n2', title:'General Body Meeting — August 12, 2026',      body:'The next General Body Meeting will be held on August 12, 2026, at 7:00 PM. Attendance is mandatory. Agenda includes Q3 financial review and two new investment proposals.', category:'Meeting',      author:'Admin', published:true,  createdAt:'2026-06-28T14:30:00Z' },
      { id:'n3', title:'Portfolio Update: Two New Instruments Added', body:'We are pleased to announce the addition of a government sukuk and a high-yield savings instrument. Details shared via email.',                  category:'Investment',   author:'Admin', published:true,  createdAt:'2026-06-15T09:00:00Z' },
      { id:'n4', title:'Welcome — Executive Committee 2026–2028',     body:'The newly elected Executive Committee officially took charge on April 23, 2026. We reaffirm our commitment to transparent, democratic governance.', category:'Announcement', author:'Admin', published:true,  createdAt:'2026-04-23T08:00:00Z' },
      { id:'n5', title:'Annual Report 2025 Now Available',            body:'The Annual Report for fiscal year 2025 is available in the Financial Transparency section. Please review before the upcoming AGM.',             category:'Finance',      author:'Admin', published:true,  createdAt:'2026-03-10T11:00:00Z' },
      { id:'n6', title:'Community Iftar Programme 2026 — Recap',     body:'Thank you to all members who participated. Over 200 underprivileged families were served. Our CSR commitment continues to grow.',                category:'CSR',          author:'Admin', published:true,  createdAt:'2026-04-01T18:00:00Z' },
      { id:'n7', title:'DRAFT: Financial Literacy Workshop',          body:'Planning a workshop on managing personal portfolios. Date TBD. Feedback welcome.',                                                               category:'Meeting',      author:'Admin', published:false, createdAt:'2026-06-30T09:00:00Z' },
    ],

    // ── Gallery ────────────────────────────────────────────────────────────────
    gallery: [
      { id:'g1', url:'https://picsum.photos/seed/dd1/640/430', caption:'Annual General Meeting 2025',        date:'2025-12-10', status:'approved', submittedBy:'admin' },
      { id:'g2', url:'https://picsum.photos/seed/dd2/640/430', caption:'Team Building Workshop',             date:'2025-11-05', status:'approved', submittedBy:'admin' },
      { id:'g3', url:'https://picsum.photos/seed/dd3/640/430', caption:'Investment Strategy Seminar',        date:'2025-10-22', status:'approved', submittedBy:'admin' },
      { id:'g4', url:'https://picsum.photos/seed/dd4/640/430', caption:'Executive Committee Inauguration',   date:'2026-04-23', status:'approved', submittedBy:'admin' },
      { id:'g5', url:'https://picsum.photos/seed/dd5/640/430', caption:'Community Iftar Programme 2026',     date:'2026-04-01', status:'approved', submittedBy:'admin' },
      { id:'g6', url:'https://picsum.photos/seed/dd6/640/430', caption:'CSR — School Supplies Drive',        date:'2026-02-14', status:'approved', submittedBy:'admin' },
      { id:'g7', url:'https://picsum.photos/seed/dd7/640/430', caption:'Financial Planning Roundtable',      date:'2025-09-18', status:'approved', submittedBy:'admin' },
      { id:'g8', url:'https://picsum.photos/seed/dd8/640/430', caption:'Founding Day Celebration, Year 5',   date:'2025-06-01', status:'approved', submittedBy:'admin' },
    ],
    gallerySubmissions: [],

    // ── Capital & Investment Settings (admin-editable) ─────────────────────────
    capitalSettings: (() => {
      try {
        const s = localStorage.getItem('dd_capital_settings');
        return s ? JSON.parse(s) : {
          totalCapital  : null,
          annualReturn  : null,
          membersOnTime : null,
          reserveFund   : null,
          lastUpdated   : null,
          note          : '',
        };
      } catch {
        return { totalCapital:null, annualReturn:null, membersOnTime:null, reserveFund:null, lastUpdated:null, note:'' };
      }
    })(),

    // ── Committee Global Settings (admin-editable) ────────────────────────────
    committeeSettings: (() => {
      try {
        const s = localStorage.getItem('dd_committee_settings');
        return s ? JSON.parse(s) : {
          bof: { termYears:2, note:'Internal rotation every 2 years. No member can hold the same position for consecutive terms.' },
          ec : { termStart:'2026-04-23', termEnd:'2028-04-23', termYears:2, note:'Current active term 2026–2028.' },
        };
      } catch {
        return {
          bof: { termYears:2, note:'' },
          ec : { termStart:'2026-04-23', termEnd:'2028-04-23', termYears:2, note:'' },
        };
      }
    })(),

    // ── Membership Applications ────────────────────────────────────────────────
    applications: [
      {
        id:'app1', status:'pending', submittedAt:'2026-06-25T10:00:00Z',
        name:'Aminul Islam',      fatherName:'Md. Jahir Islam',    motherName:'Razia Begum',
        dob:'1990-07-22',         nidNumber:'9876543210001',        occupation:'Software Engineer',
        phone:'+8801700999011',   email:'aminul@email.com',
        presentAddress : { house:'Flat 3A, Building 7', area:'Mirpur-10',    city:'Dhaka',  postCode:'1216' },
        permanentAddress:{ village:'Char Fasson',        upazila:'Bhola Sadar', district:'Bhola', postCode:'8300' },
        photo:null, nidPhoto:null, signaturePhoto:null,
        nominee:{ name:'Nasima Islam', relationship:'Wife',   nidNumber:'1111111111111', phone:'+8801700999099', photo:null, nidPhoto:null },
        references:['DD-003','DD-005'], declaration:true, reviewNote:'',
      },
      {
        id:'app2', status:'pending', submittedAt:'2026-06-20T14:00:00Z',
        name:'Sabrina Rahman',    fatherName:'Md. Mizanur Rahman', motherName:'Layla Begum',
        dob:'1993-02-14',         nidNumber:'9876543210002',        occupation:'Pharmacist',
        phone:'+8801700999012',   email:'sabrina@email.com',
        presentAddress : { house:'Road 7, House 22',   area:'Uttara',       city:'Dhaka',  postCode:'1230' },
        permanentAddress:{ village:'Comilla Sadar',     upazila:'Comilla Sadar', district:'Comilla', postCode:'3500' },
        photo:null, nidPhoto:null, signaturePhoto:null,
        nominee:{ name:'Iqbal Rahman', relationship:'Brother', nidNumber:'2222222222222', phone:'+8801700999100', photo:null, nidPhoto:null },
        references:['DD-002','DD-004'], declaration:true, reviewNote:'',
      },
      {
        id:'app3', status:'approved', submittedAt:'2026-05-10T09:00:00Z',
        name:'Jamal Uddin',       fatherName:'Md. Sumon Uddin',   motherName:'Saleha Begum',
        dob:'1989-05-25',         nidNumber:'9876543210003',        occupation:'Accountant',
        phone:'+8801700999013',   email:'jamal@email.com',
        presentAddress : { house:'House 5',             area:'Dhanmondi-15', city:'Dhaka',  postCode:'1209' },
        permanentAddress:{ village:'Sirajganj Sadar',   upazila:'Sirajganj Sadar', district:'Sirajganj', postCode:'6700' },
        photo:null, nidPhoto:null, signaturePhoto:null,
        nominee:{ name:'Hasina Uddin', relationship:'Wife',   nidNumber:'3333333333333', phone:'+8801700999101', photo:null, nidPhoto:null },
        references:['DD-001','DD-003'], declaration:true, reviewNote:'Approved. Welcome to Dream Development.',
      },
    ],

    // ── Nominee Change Requests ────────────────────────────────────────────────
    nomineeRequests: [
      { id:'nr1', memberId:'m4', memberName:'Farhan Ahmed',  currentNominee:'Sara Ahmed',    requestedNominee:'Jamal Ahmed',  reason:'Current nominee relocated abroad.',   status:'pending',  submittedAt:'2026-06-10T09:00:00Z' },
      { id:'nr2', memberId:'m6', memberName:'Rafiq Islam',   currentNominee:'Sonia Islam',   requestedNominee:'Milon Islam',  reason:'Change due to family circumstances.', status:'pending',  submittedAt:'2026-06-15T14:00:00Z' },
      { id:'nr3', memberId:'m5', memberName:'Tania Sultana', currentNominee:'Habib Sultana', requestedNominee:'Nadia Sultana',reason:'Estate planning.',                    status:'approved', submittedAt:'2026-05-20T11:00:00Z', reviewedAt:'2026-05-25T10:00:00Z' },
    ],

    // ── Invoices ───────────────────────────────────────────────────────────────
    invoices: {
      m2: [
        { id:'inv-m2-01', month:'July 2026',     amount:5000, status:'pending', paidAt:null         },
        { id:'inv-m2-02', month:'June 2026',     amount:5000, status:'paid',    paidAt:'2026-06-10' },
        { id:'inv-m2-03', month:'May 2026',      amount:5000, status:'paid',    paidAt:'2026-05-08' },
        { id:'inv-m2-04', month:'April 2026',    amount:5000, status:'paid',    paidAt:'2026-04-12' },
        { id:'inv-m2-05', month:'March 2026',    amount:5000, status:'paid',    paidAt:'2026-03-09' },
        { id:'inv-m2-06', month:'February 2026', amount:5000, status:'overdue', paidAt:null         },
        { id:'inv-m2-07', month:'January 2026',  amount:5000, status:'paid',    paidAt:'2026-01-11' },
        { id:'inv-m2-08', month:'December 2025', amount:5000, status:'paid',    paidAt:'2025-12-08' },
      ],
      m1: [
        { id:'inv-m1-01', month:'July 2026',     amount:5000, status:'paid',    paidAt:'2026-07-02' },
        { id:'inv-m1-02', month:'June 2026',     amount:5000, status:'paid',    paidAt:'2026-06-05' },
        { id:'inv-m1-03', month:'May 2026',      amount:5000, status:'paid',    paidAt:'2026-05-03' },
      ],
    },

    // ── Demo Credentials ──────────────────────────────────────────────────────
    credentials: {
      // Admin access
      'admindd2024' : { type:'admin', password:'dd@admin2024', memberId:'m1' },
      'admin@dd.org': { type:'admin', password:'dd@admin2024', memberId:'m1' },
      // Members use an Admin-assigned password; no demo password is exposed.
      'DD-001'       : { type:'member', password:'dd-member-001', memberId:'m1' },
      'DD-002'       : { type:'member', password:'dd-member-002', memberId:'m2' },
      'DD-003'       : { type:'member', password:'dd-member-003', memberId:'m3' },
      'DD-004'       : { type:'member', password:'dd-member-004', memberId:'m4' },
      'DD-005'       : { type:'member', password:'dd-member-005', memberId:'m5' },
      'DD-006'       : { type:'member', password:'dd-member-006', memberId:'m6' },
    },
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  // Auto-generate next Member ID
  const _nextMemberId = () => {
    const nums = MOCK.members.map((m) => parseInt(m.memberId.replace('DD-',''),10));
    const next = Math.max(0, ...nums) + 1;
    return `${CONFIG.ID_PREFIX}-${String(next).padStart(CONFIG.ID_DIGITS,'0')}`;
  };

  // ── Auth ───────────────────────────────────────────────────────────────────

  const adminLogin = async (email, password) => {
    if (CONFIG.USE_MOCK) {
      const cred = MOCK.credentials[email.trim().toLowerCase()];
      if (!cred || cred.type !== 'admin' || cred.password !== password)
        throw new Error('Invalid admin credentials. Please use the credentials provided by the Admin.');
      const member = MOCK.members.find((m) => m.id === cred.memberId);
      return delay({ token:`mock-admin-${Date.now()}`, user:{ ...member } });
    }
    return request('/auth/admin-login', { method:'POST', body:JSON.stringify({ email, password }) });
  };

  const memberLogin = async (memberId, password) => {
    if (CONFIG.USE_MOCK) {
      const cred = MOCK.credentials[memberId.toUpperCase()];
      if (!cred || cred.type !== 'member' || cred.password !== password)
        throw new Error('Invalid Member ID or password. Please use the password assigned by the Admin.');
      const member = MOCK.members.find((m) => m.id === cred.memberId);
      return delay({ token:`mock-member-${Date.now()}`, member:{ ...member } });
    }
    return request('/auth/member-login', { method:'POST', body:JSON.stringify({ memberId, password }) });
  };

  const logout = async () => {
    if (CONFIG.USE_MOCK) return delay({ success:true });
    return request('/auth/logout', { method:'POST', headers:authHeaders() });
  };

  // ── Members ────────────────────────────────────────────────────────────────

  const getMembers = async () => {
    if (CONFIG.USE_MOCK) return delay([...MOCK.members]);
    return request('/members', { headers:authHeaders() });
  };

  const getMember = async (id) => {
    if (CONFIG.USE_MOCK) {
      const m = MOCK.members.find((m) => m.id === id);
      if (!m) throw new Error('Member not found.');
      return delay({ ...m });
    }
    return request(`/members/${id}`, { headers:authHeaders() });
  };

  const createMember = async (data) => {
    if (CONFIG.USE_MOCK) {
      const memberId = data.memberId || _nextMemberId();
      const memberPassword = data.password ?? null;
      const m = {
        id       : `m${Date.now()}`,
        memberId,
        role     : 'member',
        status   : 'active',
        joinDate : new Date().toISOString().split('T')[0],
        password : memberPassword,
        photo    : `https://i.pravatar.cc/200?img=${30 + MOCK.members.length}`,
        nidPhoto : null, signaturePhoto: null,
        ...data,
      };
      MOCK.members.push(m);
      MOCK.credentials[memberId] = { type:'member', password:memberPassword, memberId:m.id };
      return delay(m);
    }
    return request('/members', { method:'POST', headers:authHeaders(), body:JSON.stringify(data) });
  };

  const updateMember = async (id, data) => {
    if (CONFIG.USE_MOCK) {
      const idx = MOCK.members.findIndex((m) => m.id === id);
      if (idx === -1) throw new Error('Member not found.');
      const old = MOCK.members[idx];
      // If ID is changing, update credentials
      if (data.memberId && data.memberId !== old.memberId) {
        delete MOCK.credentials[old.memberId];
        MOCK.credentials[data.memberId] = { type:'member', password:data.password ?? old.password ?? null, memberId:id };
      } else if (data.password !== undefined) {
        MOCK.credentials[old.memberId] = { type:'member', password:data.password, memberId:id };
      }
      Object.assign(MOCK.members[idx], data);
      return delay({ ...MOCK.members[idx] });
    }
    return request(`/members/${id}`, { method:'PUT', headers:authHeaders(), body:JSON.stringify(data) });
  };

  const deleteMember = async (id) => {
    if (CONFIG.USE_MOCK) {
      const idx = MOCK.members.findIndex((m) => m.id === id);
      if (idx === -1) throw new Error('Member not found.');
      const member = MOCK.members[idx];
      delete MOCK.credentials[member.memberId];
      MOCK.members.splice(idx, 1);
      return delay({ success:true });
    }
    return request(`/members/${id}`, { method:'DELETE', headers:authHeaders() });
  };

  const sendIdEmail = async (memberId) => {
    if (CONFIG.USE_MOCK) return delay({ success:true, message:`Member ID sent to registered email.` });
    return request(`/members/${memberId}/send-id-email`, { method:'POST', headers:authHeaders() });
  };

  // ── Applications ───────────────────────────────────────────────────────────

  const getApplications = async () => {
    if (CONFIG.USE_MOCK) return delay([...MOCK.applications]);
    return request('/applications', { headers:authHeaders() });
  };

  const submitApplication = async (data) => {
    if (CONFIG.USE_MOCK) {
      const app = { id:`app${Date.now()}`, status:'pending', submittedAt:new Date().toISOString(), reviewNote:'', ...data };
      MOCK.applications.unshift(app);
      return delay(app);
    }
    return request('/applications', { method:'POST', body:JSON.stringify(data) });
  };

  const approveApplication = async (appId) => {
    if (CONFIG.USE_MOCK) {
      const idx = MOCK.applications.findIndex((a) => a.id === appId);
      if (idx === -1) throw new Error('Application not found.');
      const app = MOCK.applications[idx];
      // Auto-create member from application
      const newMember = await createMember({
        name:app.name, fatherName:app.fatherName, motherName:app.motherName,
        dob:app.dob, nidNumber:app.nidNumber, occupation:app.occupation,
        phone:app.phone, email:app.email,
        presentAddress:app.presentAddress, permanentAddress:app.permanentAddress,
        photo:app.photo, nidPhoto:app.nidPhoto, signaturePhoto:app.signaturePhoto,
        nominee:app.nominee,
      });
      MOCK.applications[idx].status = 'approved';
      MOCK.applications[idx].reviewNote = `Approved. Member ID: ${newMember.memberId}`;
      MOCK.applications[idx].assignedMemberId = newMember.memberId;
      return delay({ application:MOCK.applications[idx], member:newMember });
    }
    return request(`/applications/${appId}/approve`, { method:'POST', headers:authHeaders() });
  };

  const rejectApplication = async (appId, reason) => {
    if (CONFIG.USE_MOCK) {
      const idx = MOCK.applications.findIndex((a) => a.id === appId);
      if (idx === -1) throw new Error('Application not found.');
      MOCK.applications[idx].status = 'rejected';
      MOCK.applications[idx].reviewNote = reason;
      return delay({ ...MOCK.applications[idx] });
    }
    return request(`/applications/${appId}/reject`, { method:'POST', headers:authHeaders(), body:JSON.stringify({ reason }) });
  };

  // ── Board of Founders ──────────────────────────────────────────────────────

  const getBoardOfFounders = async () => {
    if (CONFIG.USE_MOCK) return delay([...MOCK.boardOfFounders].sort((a,b)=>a.order-b.order));
    return request('/board-of-founders');
  };

  const updateBoardOfFounders = async (data) => {
    if (CONFIG.USE_MOCK) {
      MOCK.boardOfFounders.length = 0;
      data.forEach((m) => MOCK.boardOfFounders.push(m));
      return delay([...MOCK.boardOfFounders]);
    }
    return request('/board-of-founders', { method:'PUT', headers:authHeaders(), body:JSON.stringify(data) });
  };

  // ── Executive Committee ────────────────────────────────────────────────────

  const getExecutiveCommittee = async () => {
    if (CONFIG.USE_MOCK) return delay([...MOCK.executiveCommittee].sort((a,b)=>a.order-b.order));
    return request('/executive-committee');
  };

  const updateExecutiveCommittee = async (data) => {
    if (CONFIG.USE_MOCK) {
      MOCK.executiveCommittee.length = 0;
      data.forEach((m) => MOCK.executiveCommittee.push(m));
      return delay([...MOCK.executiveCommittee]);
    }
    return request('/executive-committee', { method:'PUT', headers:authHeaders(), body:JSON.stringify(data) });
  };

  // ── Notices ────────────────────────────────────────────────────────────────

  const getNotices = async (page=1) => {
    if (CONFIG.USE_MOCK) {
      const limit=CONFIG.NOTICES_PER_PAGE, pub=MOCK.notices.filter((n)=>n.published), start=(page-1)*limit;
      return delay({ data:pub.slice(start,start+limit), total:pub.length, totalPages:Math.ceil(pub.length/limit) });
    }
    return request(`/notices?page=${page}&limit=${CONFIG.NOTICES_PER_PAGE}`);
  };

  const getAllNotices = async () => {
    if (CONFIG.USE_MOCK) return delay([...MOCK.notices]);
    return request('/notices/all', { headers:authHeaders() });
  };

  const createNotice = async (data) => {
    if (CONFIG.USE_MOCK) {
      const n = { id:`n${Date.now()}`, ...data, createdAt:new Date().toISOString() };
      MOCK.notices.unshift(n);
      return delay(n);
    }
    return request('/notices', { method:'POST', headers:authHeaders(), body:JSON.stringify(data) });
  };

  const updateNotice = async (id, data) => {
    if (CONFIG.USE_MOCK) {
      const idx = MOCK.notices.findIndex((n)=>n.id===id);
      if (idx===-1) throw new Error('Notice not found.');
      Object.assign(MOCK.notices[idx], data);
      return delay({...MOCK.notices[idx]});
    }
    return request(`/notices/${id}`, { method:'PUT', headers:authHeaders(), body:JSON.stringify(data) });
  };

  const deleteNotice = async (id) => {
    if (CONFIG.USE_MOCK) {
      const idx = MOCK.notices.findIndex((n)=>n.id===id);
      if (idx===-1) throw new Error('Not found.');
      MOCK.notices.splice(idx,1);
      return delay({ success:true });
    }
    return request(`/notices/${id}`, { method:'DELETE', headers:authHeaders() });
  };

  // ── Gallery ────────────────────────────────────────────────────────────────

  const getGallery = async (page=1) => {
    if (CONFIG.USE_MOCK) {
      const approved = MOCK.gallery.filter((g) => g.status === 'approved');
      const limit=CONFIG.GALLERY_PER_PAGE, start=(page-1)*limit;
      return delay({ data:approved.slice(start,start+limit), total:approved.length, totalPages:Math.ceil(approved.length/limit) });
    }
    return request(`/gallery?page=${page}&limit=${CONFIG.GALLERY_PER_PAGE}`);
  };

  const getGallerySubmissions = async () => {
    if (CONFIG.USE_MOCK) return delay([...MOCK.gallerySubmissions]);
    return request('/gallery/submissions');
  };

  const createGalleryEntry = async (data) => {
    if (CONFIG.USE_MOCK) {
      const entry = { id:`g${Date.now()}`, status:'approved', date:new Date().toISOString().split('T')[0], ...data };
      MOCK.gallery.unshift(entry);
      return delay(entry);
    }
    return request('/gallery', { method:'POST', headers:authHeaders(), body:JSON.stringify(data) });
  };

  const submitGallerySubmission = async (data) => {
    if (CONFIG.USE_MOCK) {
      const entry = { id:`gs${Date.now()}`, status:'pending', date:new Date().toISOString().split('T')[0], ...data };
      MOCK.gallerySubmissions.unshift(entry);
      return delay(entry);
    }
    return request('/gallery/submissions', { method:'POST', headers:authHeaders(), body:JSON.stringify(data) });
  };

  const approveGallerySubmission = async (id) => {
    if (CONFIG.USE_MOCK) {
      const idx = MOCK.gallerySubmissions.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error('Submission not found.');
      const submission = { ...MOCK.gallerySubmissions[idx], status:'approved' };
      MOCK.gallerySubmissions.splice(idx, 1);
      MOCK.gallery.unshift(submission);
      return delay(submission);
    }
    return request(`/gallery/submissions/${id}/approve`, { method:'POST', headers:authHeaders() });
  };

  const rejectGallerySubmission = async (id) => {
    if (CONFIG.USE_MOCK) {
      const idx = MOCK.gallerySubmissions.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error('Submission not found.');
      const submission = { ...MOCK.gallerySubmissions[idx], status:'rejected' };
      MOCK.gallerySubmissions.splice(idx, 1);
      return delay(submission);
    }
    return request(`/gallery/submissions/${id}/reject`, { method:'POST', headers:authHeaders() });
  };

  // ── Nominee Change Requests ────────────────────────────────────────────────

  const getNomineeRequests = async () => {
    if (CONFIG.USE_MOCK) return delay([...MOCK.nomineeRequests]);
    return request('/nominee-requests', { headers:authHeaders() });
  };

  const submitNomineeRequest = async (data) => {
    if (CONFIG.USE_MOCK) {
      const r = { id:`nr${Date.now()}`, ...data, status:'pending', submittedAt:new Date().toISOString() };
      MOCK.nomineeRequests.unshift(r);
      return delay(r);
    }
    return request('/nominee-requests', { method:'POST', headers:authHeaders(), body:JSON.stringify(data) });
  };

  const updateNomineeRequest = async (id, action, reason='') => {
    if (CONFIG.USE_MOCK) {
      const idx = MOCK.nomineeRequests.findIndex((r)=>r.id===id);
      if (idx===-1) throw new Error('Not found.');
      MOCK.nomineeRequests[idx].status = action;
      MOCK.nomineeRequests[idx].reviewedAt = new Date().toISOString();
      if (reason) MOCK.nomineeRequests[idx].rejectionReason = reason;
      if (action==='approved') {
        const req=MOCK.nomineeRequests[idx];
        const mIdx=MOCK.members.findIndex((m)=>m.id===req.memberId);
        if (mIdx!==-1) MOCK.members[mIdx].nominee = { ...MOCK.members[mIdx].nominee, name:req.requestedNominee };
      }
      return delay({...MOCK.nomineeRequests[idx]});
    }
    return request(`/nominee-requests/${id}/${action}`, { method:'POST', headers:authHeaders(), body:JSON.stringify({ reason }) });
  };

  // ── Invoices ───────────────────────────────────────────────────────────────

  const getMemberInvoices = async (memberId, page=1) => {
    if (CONFIG.USE_MOCK) {
      const all=MOCK.invoices[memberId]||[], limit=CONFIG.INVOICES_PER_PAGE, start=(page-1)*limit;
      return delay({ data:all.slice(start,start+limit), total:all.length, totalPages:Math.ceil(all.length/limit) });
    }
    return request(`/members/${memberId}/invoices?page=${page}`, { headers:authHeaders() });
  };

  // ── Capital & Investment Settings ─────────────────────────────────────────

  const getCapitalSettings = async () => {
    if (CONFIG.USE_MOCK) return delay({ ...MOCK.capitalSettings });
    return request('/capital-settings', { headers:authHeaders() });
  };

  const updateCapitalSettings = async (data) => {
    if (CONFIG.USE_MOCK) {
      Object.assign(MOCK.capitalSettings, data, { lastUpdated:new Date().toISOString() });
      try { localStorage.setItem('dd_capital_settings', JSON.stringify(MOCK.capitalSettings)); } catch {}
      return delay({ ...MOCK.capitalSettings });
    }
    return request('/capital-settings', { method:'PUT', headers:authHeaders(), body:JSON.stringify(data) });
  };

  // ── Committee Global Settings ─────────────────────────────────────────────

  const getCommitteeSettings = async () => {
    if (CONFIG.USE_MOCK) return delay({ ...MOCK.committeeSettings });
    return request('/committee-settings', { headers:authHeaders() });
  };

  /** type = 'bof' | 'ec' */
  const updateCommitteeSettings = async (type, data) => {
    if (CONFIG.USE_MOCK) {
      MOCK.committeeSettings[type] = { ...MOCK.committeeSettings[type], ...data };
      try { localStorage.setItem('dd_committee_settings', JSON.stringify(MOCK.committeeSettings)); } catch {}
      return delay({ ...MOCK.committeeSettings });
    }
    return request(`/committee-settings/${type}`, { method:'PUT', headers:authHeaders(), body:JSON.stringify(data) });
  };

  // ── Invoice Management (admin uploads receipts to member accounts) ─────────

  /**
   * Upload or update an invoice/receipt for a member.
   * If an invoice with the same month already exists it is updated; otherwise a new one is created.
   */
  const uploadMemberInvoice = async (memberId, invoiceData) => {
    if (CONFIG.USE_MOCK) {
      if (!MOCK.invoices[memberId]) MOCK.invoices[memberId] = [];
      const existing = MOCK.invoices[memberId].findIndex((i) => i.month === invoiceData.month);
      const entry = {
        id         : existing !== -1 ? MOCK.invoices[memberId][existing].id : `inv-${memberId}-${Date.now()}`,
        ...invoiceData,
        uploadedBy : Auth.getUser()?.name || 'Admin',
        uploadedAt : new Date().toISOString(),
      };
      if (existing !== -1) MOCK.invoices[memberId][existing] = entry;
      else MOCK.invoices[memberId].unshift(entry);
      return delay(entry);
    }
    return request(`/members/${memberId}/invoices`, { method:'POST', headers:authHeaders(), body:JSON.stringify(invoiceData) });
  };

  const deleteMemberInvoice = async (memberId, invoiceId) => {
    if (CONFIG.USE_MOCK) {
      if (!MOCK.invoices[memberId]) throw new Error('No invoices found.');
      const idx = MOCK.invoices[memberId].findIndex((i) => i.id === invoiceId);
      if (idx === -1) throw new Error('Invoice not found.');
      MOCK.invoices[memberId].splice(idx, 1);
      return delay({ success:true });
    }
    return request(`/members/${memberId}/invoices/${invoiceId}`, { method:'DELETE', headers:authHeaders() });
  };

  return {
    adminLogin, memberLogin, logout,
    getMembers, getMember, createMember, updateMember, deleteMember, sendIdEmail,
    getApplications, submitApplication, approveApplication, rejectApplication,
    getBoardOfFounders, updateBoardOfFounders,
    getExecutiveCommittee, updateExecutiveCommittee,
    getNotices, getAllNotices, createNotice, updateNotice, deleteNotice,
    getGallery, getGallerySubmissions, createGalleryEntry,
    submitGallerySubmission, approveGallerySubmission, rejectGallerySubmission,
    getNomineeRequests, submitNomineeRequest, updateNomineeRequest,
    getMemberInvoices, uploadMemberInvoice, deleteMemberInvoice,
    getCapitalSettings, updateCapitalSettings,
    getCommitteeSettings, updateCommitteeSettings,
  };

})();
