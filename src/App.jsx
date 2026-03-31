import { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from "react";

// ============================================================
// LADYBUDDY — Comprehensive Business Management Platform
// Ladybug Laundry  •  Production Blueprint
// ============================================================

const AppContext = createContext();
const useApp = () => useContext(AppContext);

/* ---------- palette ---------- */
const C = {
  red:"#E53935",redDk:"#C62828",redLt:"#FFCDD2",
  blue:"#1E88E5",blueDk:"#1565C0",blueLt:"#BBDEFB",sky:"#81D4FA",
  blk:"#1A1A1A",dk:"#2D2D2D",mid:"#6B7280",lt:"#F3F4F6",wh:"#FFFFFF",
  grn:"#43A047",grnLt:"#C8E6C9",org:"#FB8C00",orgLt:"#FFE0B2",
  yel:"#FDD835",yelLt:"#FFF9C4",purp:"#7E57C2",purpLt:"#EDE7F6",
};
const SEV={Critical:{bg:"#FFCDD2",tx:"#C62828"},High:{bg:"#FFE0B2",tx:"#E65100"},Medium:{bg:"#FFF9C4",tx:"#F57F17"},Low:{bg:"#C8E6C9",tx:"#2E7D32"}};
const OSTATUS={"Awaiting Clean":{bg:C.blueLt,tx:C.blueDk},Washers:{bg:C.orgLt,tx:"#E65100"},Dryers:{bg:"#F3E5F5",tx:"#6A1B9A"},Folding:{bg:C.purpLt,tx:"#6A1B9A"},Ready:{bg:C.grnLt,tx:"#2E7D32"},"On Hold":{bg:C.redLt,tx:C.redDk},Cancelled:{bg:"#ECEFF1",tx:"#546E7A"}};
const TSTATUS={Open:{bg:C.blueLt,tx:C.blueDk},"In Progress":{bg:C.orgLt,tx:"#E65100"},"Awaiting Customer":{bg:C.yelLt,tx:"#F57F17"},Resolved:{bg:C.grnLt,tx:"#2E7D32"},Closed:{bg:"#ECEFF1",tx:"#546E7A"}};

/* ---------- initial data (mutable via state) ---------- */
const initLocations = () => [{id:1,name:"Downtown"},{id:2,name:"Westside"},{id:3,name:"Eastgate"},{id:4,name:"Northpark"},{id:5,name:"Southview"}];
const ROLES=["Administrator","Director","Specialist","Lead","Attendant"];
const initUsers = () => [
  {id:1,name:"Sarah Mitchell",role:"Administrator",email:"sarah@ladybuglaundry.com",locations:[1,2,3,4,5]},
  {id:2,name:"James Porter",role:"Director",email:"james@ladybuglaundry.com",locations:[1,2,3]},
  {id:3,name:"Maria Garcia",role:"Specialist",email:"maria@ladybuglaundry.com",locations:[1,2]},
  {id:4,name:"Tyler Reed",role:"Lead",email:"tyler@ladybuglaundry.com",locations:[1]},
  {id:5,name:"Aisha Johnson",role:"Attendant",email:"aisha@ladybuglaundry.com",locations:[1]},
  {id:6,name:"Carlos Ruiz",role:"Attendant",email:"carlos@ladybuglaundry.com",locations:[2]},
  {id:7,name:"Devon Parker",role:"Lead",email:"devon@ladybuglaundry.com",locations:[2,3]},
  {id:8,name:"Nina Patel",role:"Specialist",email:"nina@ladybuglaundry.com",locations:[3,4]},
];
const initCategories = () => [{id:1,name:"Retail Products"},{id:2,name:"WDF"},{id:3,name:"Household Items"},{id:4,name:"Misc"}];
const initProducts = () => [
  {id:1,name:"Detergent Pod Pack",cat:1,price:5.99,mult:"piece",track:true,inv:45,min:10,tax:true},
  {id:2,name:"Fabric Softener",cat:1,price:4.49,mult:"piece",track:true,inv:32,min:8,tax:true},
  {id:3,name:"Dryer Sheets",cat:1,price:3.99,mult:"piece",track:true,inv:58,min:15,tax:true},
  {id:4,name:"Standard Wash & Fold",cat:2,price:1.89,mult:"pound",track:false,tax:false,svc:true},
  {id:5,name:"Premium Wash & Fold",cat:2,price:2.49,mult:"pound",track:false,tax:false,svc:true},
  {id:6,name:"Comforter - Small",cat:3,price:18.99,mult:"piece",track:false,tax:false,svc:true},
  {id:7,name:"Comforter - Large",cat:3,price:24.99,mult:"piece",track:false,tax:false,svc:true},
  {id:8,name:"Sleeping Bag",cat:3,price:22.99,mult:"piece",track:false,tax:false,svc:true},
  {id:9,name:"Alteration - Hem",cat:4,price:12.99,mult:"piece",track:false,tax:false,svc:true},
  {id:10,name:"Stain Treatment",cat:4,price:4.99,mult:"piece",track:false,tax:false,svc:true},
];
const initCustomers = () => [
  {id:1,first:"John",last:"Smith",phone:"515-555-0101",email:"john.smith@email.com",disc:"None",notes:"Prefers unscented",biz:false,credit:12.50},
  {id:2,first:"Emily",last:"Chen",phone:"515-555-0102",email:"emily.chen@email.com",disc:"Senior 10%",notes:"",biz:false,credit:0},
  {id:3,first:"Westside Hotel",last:"Group",phone:"515-555-0200",email:"laundry@westsidehotel.com",disc:"Business 15%",notes:"Weekly pickup Wed",biz:true,credit:0},
  {id:4,first:"Marcus",last:"Williams",phone:"515-555-0103",email:"marcus.w@email.com",disc:"None",notes:"",biz:false,credit:5},
  {id:5,first:"Fresh Linens",last:"Restaurant Supply",phone:"515-555-0300",email:"orders@freshlinens.com",disc:"Business 20%",notes:"Daily M-F",biz:true,credit:0},
];
const DISCOUNTS=[{name:"None",pct:0},{name:"Senior 10%",pct:10},{name:"Military 15%",pct:15},{name:"Business 15%",pct:15},{name:"Business 20%",pct:20},{name:"Employee 25%",pct:25}];
const initMachines = (loc) => {
  const ct = loc === 1 ? 30 : loc === 2 ? 20 : 15;
  const dct = loc === 1 ? 25 : loc === 2 ? 20 : 12;
  return {
    washers: Array.from({length:ct},(_,i)=>({id:`W${i+1}`,type:"washer",status:(loc===1&&(i===5||i===12))||(loc===2&&i===3)?"down":"ok"})),
    dryers: Array.from({length:dct},(_,i)=>({id:`D${i+1}`,type:"dryer",status:loc===1&&i===8?"down":"ok"})),
  };
};
const initOrders = () => [
  {id:"ORD-001",cid:1,loc:1,items:[{pid:4,qty:12,u:"lbs"}],status:"Ready",due:"2026-03-31",at:"2026-03-29 09:15",by:4,w:"W3",d:"D7",total:22.68,locked:true,hist:[{s:"Awaiting Clean",t:"03/29 09:15",u:"Tyler Reed"},{s:"Machines",t:"03/29 10:00",u:"Aisha Johnson"},{s:"Folding",t:"03/29 11:30",u:"Aisha Johnson"},{s:"Ready",t:"03/29 12:15",u:"Tyler Reed"}]},
  {id:"ORD-002",cid:2,loc:1,items:[{pid:5,qty:8,u:"lbs"}],status:"Washers",due:"2026-03-31",at:"2026-03-30 08:00",by:5,w:"W8",d:null,total:19.92,locked:false,hist:[{s:"Awaiting Clean",t:"03/30 08:00",u:"Aisha Johnson"},{s:"Washers",t:"03/30 09:30",u:"Aisha Johnson"}]},
  {id:"ORD-003",cid:4,loc:1,items:[{pid:6,qty:2,u:"pcs"}],status:"Awaiting Clean",due:"2026-04-01",at:"2026-03-30 10:00",by:4,total:37.98,locked:false,hist:[{s:"Awaiting Clean",t:"03/30 10:00",u:"Tyler Reed"}]},
  {id:"ORD-004",cid:3,loc:2,items:[{pid:4,qty:45,u:"lbs"}],status:"Folding",due:"2026-03-31",at:"2026-03-29 14:00",by:7,w:"W5",d:"D3",total:85.05,locked:false,hist:[{s:"Awaiting Clean",t:"03/29 14:00",u:"Devon Parker"},{s:"Machines",t:"03/29 15:00",u:"Carlos Ruiz"},{s:"Folding",t:"03/29 17:00",u:"Carlos Ruiz"}]},
  {id:"ORD-005",cid:5,loc:1,items:[{pid:4,qty:60,u:"lbs"},{pid:10,qty:3,u:"pcs"}],status:"On Hold",due:"2026-04-01",at:"2026-03-30 07:00",by:4,total:128.37,locked:false,hold:"Staining found on linens — awaiting customer confirmation",hist:[{s:"Awaiting Clean",t:"03/30 07:00",u:"Tyler Reed"},{s:"On Hold",t:"03/30 07:30",u:"Tyler Reed"}]},
];
const initTasks = () => ({
  1:[
    {id:1,text:"Clean lint traps on all dryers",day:"Monday",time:"09:00 AM",role:"All",done:true,doneBy:"Aisha Johnson",doneAt:"08:45 AM"},
    {id:2,text:"Wipe down folding tables",day:"Monday",time:"10:00 AM",role:"Attendant",done:true,doneBy:"Aisha Johnson",doneAt:"09:30 AM"},
    {id:3,text:"Restock detergent vending",day:"Monday",time:"11:00 AM",role:"All",done:false},
    {id:4,text:"Empty trash receptacles",day:"Monday",time:"12:00 PM",role:"Attendant",done:false},
    {id:5,text:"Mop floors — front area",day:"Monday",time:"02:00 PM",role:"All",done:false},
    {id:6,text:"Check soap dispensers",day:"Monday",time:"03:00 PM",role:"Lead",done:false},
    {id:7,text:"End of day cash count",day:"Monday",time:"08:00 PM",role:"Lead",done:false},
  ],
  2:[
    {id:8,text:"Wipe machines exterior",day:"Monday",time:"09:00 AM",role:"All",done:false},
    {id:9,text:"Check lost & found bin",day:"Monday",time:"10:00 AM",role:"Lead",done:false},
  ],
});
const initMaint = () => [
  {id:"MR-001",loc:1,eqType:"Washer",eqNum:"W6",sev:"High",reason:"Leaking water",status:"Parts Ordered",repBy:"Tyler Reed",repAt:"03/28 10:00",techBy:"Tech: Mike",techAt:"03/28 14:00",notes:"Water pump seal damaged",parts:[{name:"Water Pump Seal",vendor:"PartsDirect",est:"04/01",act:null,cost:45}],remedy:null},
  {id:"MR-002",loc:1,eqType:"Washer",eqNum:"W13",sev:"Medium",reason:"Not spinning",status:"Needs Diagnostics",repBy:"Aisha Johnson",repAt:"03/29 08:30",techBy:null,techAt:null,notes:"",parts:[],remedy:null},
  {id:"MR-003",loc:1,eqType:"Dryer",eqNum:"D9",sev:"Critical",reason:"Not heating",status:"Inspected",repBy:"Tyler Reed",repAt:"03/27 16:00",techBy:"Tech: Mike",techAt:"03/28 09:00",notes:"Heating element burned out",parts:[],remedy:null},
  {id:"MR-004",loc:2,eqType:"Washer",eqNum:"W4",sev:"Low",reason:"Noisy during spin",status:"Fixed",repBy:"Carlos Ruiz",repAt:"03/25 11:00",techBy:"Tech: Dave",techAt:"03/25 15:00",notes:"Bearing worn",parts:[{name:"Drum Bearing Kit",vendor:"LaundryParts Co",est:"03/26",act:"03/26",cost:32}],remedy:"Replaced drum bearing assembly",fixAt:"03/27 10:00"},
];
const initMsgs = () => [
  {id:1,from:1,to:[2,3,4,5,6,7,8],subj:"New Cleaning Protocol",body:"Team, please review the updated cleaning protocol in the Knowledge Base. All locations must implement by Friday.",ts:"03/29 09:00",read:{2:true,3:true,4:false,5:false,6:false,7:true,8:false}},
  {id:2,from:4,to:[1,2],subj:"Machine W6 — Downtown",body:"The leak on W6 is getting worse. Parts were ordered but we may need to expedite.",ts:"03/29 14:30",read:{1:true,2:false}},
  {id:3,from:2,to:[3,7,8],subj:"Monthly Reviews",body:"Scheduling monthly performance reviews for next week. Please confirm availability.",ts:"03/30 08:00",read:{3:false,7:false,8:false}},
];
const initGroups = () => [
  {id:1,name:"All Locations",members:[1,2,3,4,5,6,7,8],msgs:[{from:1,body:"Welcome to the team channel!",ts:"03/01 09:00"}]},
  {id:2,name:"Downtown Team",members:[1,2,3,4,5],msgs:[]},
  {id:3,name:"Management",members:[1,2],msgs:[{from:1,body:"Q1 review meeting Thursday at 2pm.",ts:"03/28 11:00"}]},
];
const initTickets = () => [
  {id:"TKT-001",cid:1,cat:"Refund Request",status:"In Progress",pri:"Medium",assign:[3],loc:1,by:4,at:"03/28 11:00",sla:"03/30 11:00",desc:"Customer reports clothes damaged during wash cycle. Requesting full refund.",thread:[{from:"Tyler Reed",msg:"Customer brought in damaged shirt.",t:"03/28 11:00",type:"int"},{from:"Maria Garcia",msg:"Reviewing the claim. Will inspect the item.",t:"03/28 14:00",type:"int"},{from:"System",msg:"Email sent to customer: Ticket TKT-001 received.",t:"03/28 11:01",type:"auto"}]},
  {id:"TKT-002",cid:4,cat:"General Inquiry",status:"Open",pri:"Low",assign:[4],loc:1,by:5,at:"03/30 09:00",sla:"04/02 09:00",desc:"Customer wants to know about business account options.",thread:[{from:"Aisha Johnson",msg:"Customer interested in setting up business account.",t:"03/30 09:00",type:"int"}]},
  {id:"TKT-003",cid:2,cat:"Security Footage",status:"Awaiting Customer",pri:"High",assign:[2],loc:1,by:4,at:"03/27 15:00",sla:"03/28 15:00",desc:"Customer claims items stolen from dryer. Requesting footage review.",thread:[{from:"Tyler Reed",msg:"Customer says items taken from D12.",t:"03/27 15:00",type:"int"},{from:"James Porter",msg:"Reviewed footage 3/27 2-4pm. No suspicious activity.",t:"03/28 10:00",type:"int"},{from:"James Porter",msg:"Dear Emily, we reviewed footage for the time in question. Could you confirm the exact time?",t:"03/28 10:30",type:"email"}]},
];
const TKTCATS=[{name:"Refund Request",sla:48,roles:["Specialist"]},{name:"General Inquiry",sla:72,roles:["Lead"]},{name:"Security Footage",sla:24,roles:["Director"]},{name:"Lost & Found",sla:48,roles:["Lead","Specialist"]},{name:"Complaint",sla:24,roles:["Director","Specialist"]}];
const initScheds = () => [
  {id:1,uid:4,loc:1,date:"2026-03-30",shift:"Morning",s:"06:00",e:"14:00",ci:"05:58",co:null},
  {id:2,uid:5,loc:1,date:"2026-03-30",shift:"Morning",s:"06:00",e:"14:00",ci:"06:02",co:null},
  {id:3,uid:6,loc:2,date:"2026-03-30",shift:"Afternoon",s:"14:00",e:"22:00",ci:null,co:null},
  {id:4,uid:7,loc:2,date:"2026-03-30",shift:"Morning",s:"06:00",e:"14:00",ci:"06:00",co:null},
];
const SHIFTS=[{name:"Morning",s:"06:00",e:"14:00"},{name:"Afternoon",s:"14:00",e:"22:00"},{name:"Evening",s:"16:00",e:"00:00"},{name:"Full Day",s:"08:00",e:"18:00"}];
const KBCATS=["Standard Operating Procedures","Employee Handbook","Equipment Guides","Safety Protocols","Customer Service Policies"];
const initKB = () => [
  {id:1,title:"Opening Procedures",cat:"Standard Operating Procedures",body:"Complete guide to opening each location including security checks, machine inspections, and system startup procedures.\n\n1. Arrive 15 minutes before opening.\n2. Disarm security system.\n3. Walk the floor — check for overnight issues.\n4. Power on all machines and POS terminals.\n5. Verify cash drawer amounts.\n6. Unlock front doors at scheduled time.\n7. Complete opening checklist in Tasks module.",vis:["All"],by:1,created:"01/15",updated:"03/01",ver:3,files:["opening_checklist.pdf"]},
  {id:2,title:"Employee Code of Conduct",cat:"Employee Handbook",body:"Comprehensive code of conduct covering dress code, behavior standards, communication guidelines, and conflict resolution.\n\nDress Code:\n- Company polo or approved Ladybug Laundry shirt\n- Closed-toe, non-slip shoes required\n- Name badge visible at all times\n\nBehavior Standards:\n- Professional and courteous with all customers\n- Cell phone use limited to break times\n- No personal laundry during shifts",vis:["All"],by:1,created:"01/10",updated:"02/20",ver:2,files:[]},
  {id:3,title:"Washer Maintenance Guide",cat:"Equipment Guides",body:"Detailed maintenance guide for all washer models including troubleshooting common issues.\n\nPreventive Maintenance Schedule:\n- Daily: Check for leaks, unusual sounds\n- Weekly: Clean detergent trays, inspect hoses\n- Monthly: Run cleaning cycle, check drain filters\n- Quarterly: Professional inspection\n\nCommon Issues:\n- E1 Error: Door lock failure → Reset power, check latch\n- E2 Error: Drain timeout → Check drain hose for blockage\n- E3 Error: Fill timeout → Verify water supply valves open",vis:["Administrator","Director","Specialist","Lead"],by:2,created:"02/01",updated:"03/15",ver:4,files:["washer_manual.pdf","parts_diagram.png"]},
  {id:4,title:"Chemical Safety Procedures",cat:"Safety Protocols",body:"Safety data sheets and handling procedures for all cleaning chemicals.\n\nGeneral Rules:\n- Always wear gloves when handling chemicals\n- Never mix chemicals\n- Store in original containers\n- Report any spills immediately to Lead on duty\n\nEmergency Contacts:\n- Poison Control: 1-800-222-1222\n- Location Emergency Binder: Behind front counter",vis:["All"],by:1,created:"01/20",updated:"01/20",ver:1,files:["sds_sheets.pdf"]},
  {id:5,title:"Refund Policy & Procedures",cat:"Customer Service Policies",body:"Step-by-step guide for handling customer refund requests.\n\n1. Create a ticket in Customer Service module.\n2. Document the issue with photos if applicable.\n3. Director reviews and approves/denies within SLA.\n4. If approved, apply store credit to customer account.\n5. Notify customer of resolution via ticket thread.",vis:["Administrator","Director","Specialist"],by:2,created:"02/10",updated:"03/05",ver:2,files:[]},
];
const initNotifs = () => [
  {id:1,type:"msg",text:"New message from Tyler Reed",mod:"communication",ts:"03/30 14:30",read:false},
  {id:2,type:"task",text:"Task overdue: Restock detergent vending",mod:"tasks",ts:"03/30 11:05",read:false},
  {id:3,type:"ticket",text:"Ticket TKT-002 assigned to you",mod:"customer-service",ts:"03/30 09:00",read:false},
  {id:4,type:"maint",text:"Equipment D9 — Critical: Not heating",mod:"maintenance",ts:"03/27 16:00",read:true},
  {id:5,type:"inv",text:"Low stock: Fabric Softener (32 units)",mod:"sales",ts:"03/30 07:00",read:false},
  {id:6,type:"sched",text:"Carlos Ruiz has not clocked in",mod:"time-attendance",ts:"03/30 14:15",read:false},
];

/* ---- helpers ---- */
const nid = () => Math.random().toString(36).slice(2,8).toUpperCase();
const now = () => {const d=new Date();return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
const custName = (c) => c ? `${c.first} ${c.last}` : "Unknown";
const userName = (users,id) => users.find(u=>u.id===id)?.name||"Unknown";

/* ============================================================
   UI Primitives
   ============================================================ */
const Ico = ({d,sz=20,c="currentColor"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const ICONS = {
  home:<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></>,
  clip:<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 012-2h2a2 2 0 012 2H9z"/></>,
  chk:<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
  wrn:<><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></>,
  chat:<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
  ppl:<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  clk:<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
  book:<><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></>,
  bar:<><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></>,
  bell:<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
  srch:<><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>,
  plus:<><path d="M12 5v14m-7-7h14"/></>,
  chvD:<><path d="M6 9l6 6 6-6"/></>,
  chvR:<><path d="M9 18l6-6-6-6"/></>,
  tick:<><path d="M20 6L9 17l-5-5"/></>,
  x:<><path d="M18 6L6 18M6 6l12 12"/></>,
  dl:<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></>,
  print:<><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></>,
  usr:<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  mail:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></>,
  send:<><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></>,
  pin:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
  $:<><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
  pkg:<><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></>,
  edit:<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></>,
  trash:<><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>,
  back:<><path d="M19 12H5M12 19l-7-7 7-7"/></>,
  alert:<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></>,
  eye:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  att:<><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></>,
  set:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  menu:<><path d="M3 12h18M3 6h18M3 18h18"/></>,
  swap:<><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></>,
  box:<><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></>,
  bldg:<><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></>,
  heart:<><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>,
  star:<><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>,
  file:<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
  truck:<><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  award:<><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></>,
  flag:<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></>,
};

/* --- small components --- */
const Bdg = ({children,c=C.blue,bg,sm}) => <span style={{display:"inline-flex",alignItems:"center",padding:sm?"1px 7px":"2px 10px",borderRadius:999,fontSize:sm?10:11,fontWeight:600,backgroundColor:bg||`${c}18`,color:c,letterSpacing:"0.02em",whiteSpace:"nowrap",lineHeight:"18px"}}>{children}</span>;
const Btn = ({children,v="primary",sz="md",onClick,dis,ico,full,sty}) => {
  const S={primary:{bg:C.red,c:C.wh},secondary:{bg:C.wh,c:C.blk,bd:"1px solid #E5E7EB"},ghost:{bg:"transparent",c:C.mid},blue:{bg:C.blue,c:C.wh},danger:{bg:"#DC2626",c:C.wh},green:{bg:C.grn,c:C.wh}};
  const s=S[v]||S.primary; const pd=sz==="sm"?"6px 12px":sz==="lg"?"12px 24px":"8px 16px"; const fs=sz==="sm"?12:sz==="lg"?15:13;
  return <button onClick={onClick} disabled={dis} style={{display:"inline-flex",alignItems:"center",gap:6,padding:pd,fontSize:fs,fontWeight:600,backgroundColor:s.bg,color:s.c,border:s.bd||"none",borderRadius:8,cursor:dis?"not-allowed":"pointer",opacity:dis?.5:1,transition:"all .15s",fontFamily:"inherit",width:full?"100%":undefined,justifyContent:full?"center":undefined,...sty}}>{ico&&<Ico d={ICONS[ico]} sz={sz==="sm"?14:16}/>}{children}</button>;
};
const Crd = ({children,sty,onClick}) => <div onClick={onClick} style={{backgroundColor:C.wh,borderRadius:12,border:"1px solid #E5E7EB",padding:20,cursor:onClick?"pointer":"default",...sty}}>{children}</div>;
const Inp = ({val,set,ph,type="text",sty}) => <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} type={type} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",...sty}}/>;
const Txta = ({val,set,ph,rows=3}) => <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={rows} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>;
const Sel = ({val,set,opts,ph,sty}) => <div style={{position:"relative",...sty}}><select value={val} onChange={e=>set(e.target.value)} style={{width:"100%",padding:"10px 32px 10px 12px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,fontFamily:"inherit",outline:"none",appearance:"none",backgroundColor:C.wh,cursor:"pointer"}}>{ph&&<option value="">{ph}</option>}{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select><div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Ico d={ICONS.chvD} sz={14} c={C.mid}/></div></div>;
const SrchBar = ({val,set,ph="Search..."}) => <div style={{position:"relative",width:"100%"}}><div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><Ico d={ICONS.srch} sz={16} c={C.mid}/></div><input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",padding:"10px 12px 10px 38px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>;
const Stat = ({label,value,ico,c=C.blue,sub}) => <Crd sty={{display:"flex",alignItems:"flex-start",gap:16}}><div style={{width:44,height:44,borderRadius:10,backgroundColor:`${c}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico d={ICONS[ico]} sz={22} c={c}/></div><div style={{flex:1}}><div style={{fontSize:12,color:C.mid,fontWeight:500,marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</div><div style={{fontSize:28,fontWeight:700,color:C.blk,lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:12,color:C.mid,marginTop:4}}>{sub}</div>}</div></Crd>;
const Avt = ({name,sz=32,c=C.blue}) => {const ini=name?.split(" ").map(n=>n[0]).join("").slice(0,2)||"?";return <div style={{width:sz,height:sz,borderRadius:"50%",backgroundColor:`${c}18`,color:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.38,fontWeight:700,flexShrink:0}}>{ini}</div>;};
const SBdg = ({status,map}) => {const s=map[status]||{bg:"#E5E7EB",tx:"#6B7280"};return <Bdg c={s.tx} bg={s.bg}>{status}</Bdg>;};
const TabB = ({tabs,act,set}) => <div style={{display:"flex",gap:2,borderBottom:"2px solid #E5E7EB",marginBottom:20}}>{tabs.map(t=><button key={t.id} onClick={()=>set(t.id)} style={{padding:"10px 20px",fontSize:13,fontWeight:600,border:"none",background:"none",cursor:"pointer",fontFamily:"inherit",color:act===t.id?C.red:C.mid,borderBottom:act===t.id?`2px solid ${C.red}`:"2px solid transparent",marginBottom:-2,transition:"all .15s"}}>{t.l}{t.n!=null?` (${t.n})`:""}</button>)}</div>;

const Modal = ({title,onClose,children,w="580px"}) => <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{backgroundColor:C.wh,borderRadius:16,width:"100%",maxWidth:w,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:"1px solid #E5E7EB"}}><h3 style={{fontSize:17,fontWeight:700,color:C.blk,margin:0}}>{title}</h3><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Ico d={ICONS.x} sz={20} c={C.mid}/></button></div><div style={{padding:24,overflowY:"auto",flex:1}}>{children}</div></div></div>;

const Field = ({label,children}) => <div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,fontWeight:600,color:C.mid,marginBottom:6,textTransform:"uppercase",letterSpacing:".04em"}}>{label}</label>{children}</div>;

const Tbl = ({cols,data,onRow}) => <div style={{overflowX:"auto",borderRadius:10,border:"1px solid #E5E7EB"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{backgroundColor:"#F9FAFB"}}>{cols.map((c,i)=><th key={i} style={{padding:"12px 16px",textAlign:"left",fontWeight:600,color:C.mid,fontSize:11,textTransform:"uppercase",letterSpacing:".05em",borderBottom:"1px solid #E5E7EB"}}>{c.h}</th>)}</tr></thead><tbody>{data.map((r,i)=><tr key={i} onClick={()=>onRow?.(r)} style={{cursor:onRow?"pointer":"default"}} onMouseEnter={e=>e.currentTarget.style.backgroundColor="#F9FAFB"} onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>{cols.map((c,j)=><td key={j} style={{padding:"12px 16px",borderBottom:"1px solid #F3F4F6",color:C.blk}}>{c.r?c.r(r):r[c.k]}</td>)}</tr>)}</tbody></table></div>;

/* ============================================================
   SIDEBAR
   ============================================================ */
const MENU = [
  {id:"dash",l:"Dashboard",ico:"home"},
  {id:"sales",l:"Sales",ico:"$"},
  {id:"tasks",l:"Tasks",ico:"chk"},
  {id:"maint",l:"Maintenance",ico:"wrn"},
  {id:"comm",l:"Communication",ico:"chat"},
  {id:"cs",l:"Customer Service",ico:"ppl"},
  {id:"ta",l:"Time & Attendance",ico:"clk"},
  {id:"kb",l:"Knowledge Base",ico:"book"},
  {id:"inv",l:"Inventory",ico:"box"},
  {id:"proj",l:"Projects",ico:"bldg"},
  {id:"hr",l:"HR",ico:"award"},
];
const Sidebar = ({active,go,col}) => {
  const {user,users} = useApp();
  const isAD = ["Administrator","Director"].includes(user.role);
  const items = [...MENU,...(isAD?[{id:"reports",l:"Reports",ico:"bar"}]:[])];
  return <div style={{width:col?68:240,height:"100vh",backgroundColor:C.blk,display:"flex",flexDirection:"column",transition:"width .2s",position:"fixed",left:0,top:0,zIndex:50}}>
    <div style={{padding:col?"20px 16px":"20px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
      <Avt name={user.name} sz={36} c={C.red}/>
      {!col&&<div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:C.wh,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{user.role}</div></div>}
    </div>
    <div style={{flex:1,padding:"12px 8px",overflowY:"auto"}}>
      {items.map(i=>{const a=active===i.id;return <button key={i.id} onClick={()=>go(i.id)} title={col?i.l:undefined} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:col?12:"10px 14px",borderRadius:8,border:"none",cursor:"pointer",backgroundColor:a?"rgba(255,255,255,.12)":"transparent",color:a?C.wh:"rgba(255,255,255,.5)",fontSize:13,fontWeight:a?600:500,fontFamily:"inherit",transition:"all .15s",marginBottom:2,justifyContent:col?"center":"flex-start"}}><Ico d={ICONS[i.ico]} sz={20} c={a?C.wh:"rgba(255,255,255,.5)"}/>{!col&&i.l}</button>;})}
    </div>
    <div style={{padding:col?"16px 8px":16,borderTop:"1px solid rgba(255,255,255,.08)",textAlign:col?"center":"left"}}>
      {col?<div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`linear-gradient(135deg,${C.red},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:C.wh,margin:"0 auto"}}>LB</div>
      :<div style={{fontSize:16,fontWeight:800,letterSpacing:"-.02em"}}><span style={{color:C.wh}}>Lady</span><span style={{color:C.red}}>BUDDY</span></div>}
    </div>
  </div>;
};

/* ============================================================
   NOTIFICATION PANEL
   ============================================================ */
const NotifPanel = ({notifs,setNotifs,close}) => <div style={{position:"absolute",top:52,right:0,width:360,backgroundColor:C.wh,borderRadius:12,border:"1px solid #E5E7EB",boxShadow:"0 10px 40px rgba(0,0,0,.12)",zIndex:100,overflow:"hidden"}}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid #E5E7EB"}}>
    <span style={{fontSize:15,fontWeight:700,color:C.blk}}>Notifications</span>
    <button onClick={()=>setNotifs(notifs.map(n=>({...n,read:true})))} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.blue,fontFamily:"inherit",fontWeight:600}}>Mark all read</button>
  </div>
  <div style={{maxHeight:400,overflowY:"auto"}}>
    {notifs.map(n=><div key={n.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 20px",borderBottom:"1px solid #F3F4F6",backgroundColor:n.read?"transparent":"#F0F7FF"}}>
      <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,marginTop:6,backgroundColor:n.read?"transparent":C.blue}}/>
      <div><div style={{fontSize:13,color:C.blk,fontWeight:n.read?400:600}}>{n.text}</div><div style={{fontSize:11,color:C.mid,marginTop:2}}>{n.ts}</div></div>
    </div>)}
  </div>
</div>;

/* ============================================================
   DASHBOARD
   ============================================================ */
const Dashboard = () => {
  const {user,orders,tasks,selectedLoc:loc,maint,tickets,msgs,scheds,customers} = useApp();
  const isAD = ["Administrator","Director"].includes(user.role);
  const locOrders = orders.filter(o=>o.loc===loc);
  const locTasks = tasks[loc]||[];
  const openOrders = locOrders.filter(o=>!["Ready","Cancelled"].includes(o.status)).length;
  const incompTasks = locTasks.filter(t=>!t.done).length;
  const unread = msgs.filter(m=>m.to.includes(user.id)&&!m.read[user.id]).length;
  const machDown = maint.filter(m=>m.status!=="Fixed").length;
  const openTkts = tickets.filter(t=>!["Resolved","Closed"].includes(t.status)).length;

  return <div>
    <div style={{marginBottom:28}}><h2 style={{fontSize:24,fontWeight:700,color:C.blk,margin:0}}>Welcome back, {user.name.split(" ")[0]}</h2><p style={{fontSize:14,color:C.mid,margin:"4px 0 0"}}>{isAD?"Here's what needs your attention today.":"Here's your shift overview."}</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:28}}>
      {isAD ? <>
        <Stat label="Unread Messages" value={unread} ico="chat" c={C.blue}/>
        <Stat label="Open Tickets" value={openTkts} ico="ppl" c={C.org}/>
        <Stat label="Machines Down" value={machDown} ico="alert" c={C.red} sub="Across all locations"/>
        <Stat label="Active Locations" value={5} ico="pin" c={C.grn}/>
      </> : <>
        <Stat label="Open Orders" value={openOrders} ico="clip" c={C.blue}/>
        <Stat label="Incomplete Tasks" value={incompTasks} ico="chk" c={C.org}/>
        <Stat label="Unread Messages" value={unread} ico="chat" c={C.purp}/>
        <Stat label="Scheduled Today" value={scheds.filter(s=>s.loc===loc&&s.date==="2026-03-30").length} ico="clk" c={C.grn}/>
      </>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <Crd><h3 style={{fontSize:15,fontWeight:700,margin:"0 0 16px",color:C.blk}}>{isAD?"Recent Tickets":"Active Orders"}</h3>
        {isAD ? tickets.slice(0,4).map(t=>{const cu=customers.find(c=>c.id===t.cid);return <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}><div><div style={{fontSize:13,fontWeight:600,color:C.blk}}>{t.id} — {t.cat}</div><div style={{fontSize:12,color:C.mid}}>{cu?custName(cu):""}</div></div><SBdg status={t.status} map={TSTATUS}/></div>;})
        : locOrders.filter(o=>o.status!=="Cancelled").slice(0,5).map(o=>{const cu=customers.find(c=>c.id===o.cid);return <div key={o.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}><div><div style={{fontSize:13,fontWeight:600,color:C.blk}}>{o.id}</div><div style={{fontSize:12,color:C.mid}}>{cu?custName(cu):""}</div></div><SBdg status={o.status} map={OSTATUS}/></div>;})}
      </Crd>
      <Crd><h3 style={{fontSize:15,fontWeight:700,margin:"0 0 16px",color:C.blk}}>{isAD?"Maintenance Overview":"Today's Tasks"}</h3>
        {isAD ? initLocations().slice(0,5).map(l=>{const cnt=maint.filter(m=>m.loc===l.id&&m.status!=="Fixed").length;return <div key={l.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Ico d={ICONS.pin} sz={16} c={C.mid}/><span style={{fontSize:13,fontWeight:600,color:C.blk}}>{l.name}</span></div><Bdg c={cnt>0?C.red:C.grn} sm>{cnt} down</Bdg></div>;})
        : locTasks.slice(0,5).map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}><div style={{width:18,height:18,borderRadius:4,border:t.done?"none":"2px solid #D1D5DB",backgroundColor:t.done?C.grn:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{t.done&&<Ico d={ICONS.tick} sz={12} c={C.wh}/>}</div><span style={{fontSize:13,color:t.done?C.mid:C.blk,textDecoration:t.done?"line-through":"none",flex:1}}>{t.text}</span><span style={{fontSize:11,color:C.mid}}>{t.time}</span></div>)}
      </Crd>
    </div>
  </div>;
};

/* ============================================================
   SALES MODULE
   ============================================================ */
const Sales = () => {
  const {selectedLoc:loc,products,setProducts,categories,customers,orders,setOrders,setCustomers,users,user} = useApp();
  const [tab,setTab] = useState("pos");
  const [srch,setSrch] = useState("");
  const [catF,setCatF] = useState("");
  const [cart,setCart] = useState([]);
  const [selCust,setSelCust] = useState(null);
  const [custModal,setCustModal] = useState(false);
  const [orderModal,setOrderModal] = useState(null);
  const [newCustModal,setNewCustModal] = useState(false);
  const [newProdModal,setNewProdModal] = useState(false);
  const [weightPopup,setWeightPopup] = useState(null);
  const [weightVal,setWeightVal] = useState("");
  const [custSrch,setCustSrch] = useState("");
  const [showCustSrch,setShowCustSrch] = useState(false);
  const [salesTab2,setSalesTab2] = useState("sales");

  const locOrders = orders.filter(o=>o.loc===loc);
  const activeOrders = locOrders.filter(o=>!["Ready","Cancelled"].includes(o.status));
  const tabs = [{id:"pos",l:"New Sale"},{id:"orders",l:"Order Tracking",n:activeOrders.length},{id:"today",l:"Today's Sales"},{id:"customers",l:"Customers"},{id:"products",l:"Products"},{id:"invoices",l:"Invoices"}];

  const addCart = (p) => {
    const ex = cart.find(c=>c.pid===p.id);
    if(ex) setCart(cart.map(c=>c.pid===p.id?{...c,qty:c.qty+(p.mult==="pound"?.5:1)}:c));
    else setCart([...cart,{pid:p.id,name:p.name,price:p.price,qty:p.mult==="pound"?1:1,mult:p.mult,svc:!!p.svc}]);
  };
  const fp = products.filter(p=>{
    const activeCat = catF || categories[0]?.id;
    if(activeCat&&p.cat!==+activeCat) return false;
    if(srch&&!p.name.toLowerCase().includes(srch.toLowerCase())) return false;
    return true;
  });
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const disc = selCust ? DISCOUNTS.find(d=>d.name===selCust.disc)?.pct||0 : 0;
  const discAmt = subtotal*disc/100;
  const taxItems = cart.filter(i=>products.find(p=>p.id===i.pid)?.tax);
  const taxAmt = taxItems.reduce((s,i)=>s+i.price*i.qty,0)*0.07;
  const total = subtotal-discAmt+taxAmt;
  const hasSvc = cart.some(c=>c.svc);

  const createOrder = () => {
    if(!selCust||cart.length===0) return;
    const id = `ORD-${String(orders.length+1).padStart(3,"0")}`;
    const newOrd = {id,cid:selCust.id,loc,items:cart.map(c=>({pid:c.pid,qty:c.qty,u:c.mult==="pound"?"lbs":"pcs"})),status:hasSvc?"Awaiting Clean":"Completed",due:hasSvc?"2026-04-01":null,at:now(),by:user.id,total:+total.toFixed(2),hist:[{s:hasSvc?"Awaiting Clean":"Completed",t:now(),u:user.name}]};
    setOrders([newOrd,...orders]);
    setCart([]); setSelCust(null);
  };

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Sales</h2>
    </div>
    <TabB tabs={tabs} act={tab} set={setTab}/>

    {tab==="pos" && <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:20}}>
      <div>
        <div style={{marginBottom:16}}>
          <SrchBar val={srch} set={setSrch} ph="Search products & services..."/>
        </div>
        {/* Category Header Tabs */}
        <TabB tabs={categories.map(c=>({id:c.id,l:c.name}))} act={catF||categories[0]?.id} set={v=>setCatF(v)}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
          {fp.map(p=><Crd key={p.id} onClick={()=>{if(p.mult==="pound"){setWeightPopup(p);}else{addCart(p);}}} sty={{cursor:"pointer",padding:16,textAlign:"center",transition:"all .15s",border:"1px solid #E5E7EB"}}>
            <div style={{fontSize:13,fontWeight:600,color:C.blk,marginBottom:4}}>{p.name}</div>
            <div style={{fontSize:14,fontWeight:700,color:C.red}}>${p.price.toFixed(2)}<span style={{fontSize:11,fontWeight:400,color:C.mid}}>/{p.mult==="pound"?"lb":"ea"}</span></div>
            {p.track&&<div style={{fontSize:11,color:p.inv<=p.min?C.red:C.mid,marginTop:4}}>{p.inv} in stock</div>}
          </Crd>)}
        </div>
      </div>
      <Crd sty={{position:"sticky",top:20,alignSelf:"start"}}>
        <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 16px",color:C.blk}}>Current Sale</h3>
        {/* Inline Customer Search */}
        <div style={{marginBottom:16,position:"relative"}}>
          {selCust ? <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",backgroundColor:C.lt,borderRadius:8}}>
            <div><div style={{fontSize:13,fontWeight:600}}>{custName(selCust)}</div><div style={{fontSize:11,color:C.mid}}>{selCust.disc!=="None"?selCust.disc:"No discount"}{selCust.credit>0?` • $${selCust.credit.toFixed(2)} credit`:""}</div></div>
            <button onClick={()=>{setSelCust(null);setCustSrch("");}} style={{background:"none",border:"none",cursor:"pointer"}}><Ico d={ICONS.x} sz={16} c={C.mid}/></button>
          </div>
          : <div>
            <SrchBar val={custSrch} set={v=>{setCustSrch(v);setShowCustSrch(true);}} ph="Search customer (name, phone, email)..."/>
            {showCustSrch&&custSrch.length>=2&&<div style={{position:"absolute",left:0,right:0,top:"100%",background:C.wh,border:"1px solid #E5E7EB",borderRadius:8,zIndex:10,maxHeight:200,overflowY:"auto",boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
              {customers.filter(c=>custName(c).toLowerCase().includes(custSrch.toLowerCase())||c.phone.includes(custSrch)||c.email.toLowerCase().includes(custSrch.toLowerCase())).length===0
                ? <div style={{padding:12,fontSize:13,color:C.mid}}>No customer found. <button onClick={()=>{setShowCustSrch(false);setNewCustModal(true);}} style={{background:"none",border:"none",color:C.blue,cursor:"pointer",fontWeight:600,fontSize:13}}>+ Add New</button></div>
                : customers.filter(c=>custName(c).toLowerCase().includes(custSrch.toLowerCase())||c.phone.includes(custSrch)||c.email.toLowerCase().includes(custSrch.toLowerCase())).map(c=><div key={c.id} onClick={()=>{setSelCust(c);setCustSrch(custName(c));setShowCustSrch(false);}} style={{padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid #F3F4F6",fontSize:13}} onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.lt} onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
                  <span style={{fontWeight:600}}>{custName(c)}</span> — {c.phone}{c.disc!=="None"&&<Bdg c={C.grn} sm style={{marginLeft:6}}>{c.disc}</Bdg>}
                </div>)
              }
            </div>}
          </div>}
        </div>
        {cart.length===0 ? <div style={{textAlign:"center",padding:"30px 0",color:C.mid,fontSize:13}}>No items added yet</div>
        : <div style={{marginBottom:16}}>{cart.map((it,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:C.blk}}>{it.name}</div>{it.svc&&<Bdg c={C.blue} sm>Service</Bdg>}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:4,backgroundColor:C.lt,borderRadius:6,padding:2}}>
              <button onClick={()=>setCart(cart.map((c,j)=>j===i?{...c,qty:Math.max(.5,c.qty-(c.mult==="pound"?.5:1))}:c))} style={{width:24,height:24,border:"none",background:"none",cursor:"pointer",fontSize:16,fontWeight:700}}>−</button>
              <span style={{fontSize:13,fontWeight:600,minWidth:28,textAlign:"center"}}>{it.qty}</span>
              <button onClick={()=>setCart(cart.map((c,j)=>j===i?{...c,qty:c.qty+(c.mult==="pound"?.5:1)}:c))} style={{width:24,height:24,border:"none",background:"none",cursor:"pointer",fontSize:16,fontWeight:700}}>+</button>
            </div>
            <span style={{fontSize:13,fontWeight:600,minWidth:60,textAlign:"right"}}>${(it.price*it.qty).toFixed(2)}</span>
            <button onClick={()=>setCart(cart.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ico d={ICONS.trash} sz={14} c={C.mid}/></button>
          </div>
        </div>)}</div>}
        {cart.length>0&&<div style={{borderTop:"2px solid #E5E7EB",paddingTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13,color:C.mid}}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {disc>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13,color:C.grn}}><span>{selCust.disc}</span><span>−${discAmt.toFixed(2)}</span></div>}
          {taxAmt>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13,color:C.mid}}><span>Tax (7%)</span><span>${taxAmt.toFixed(2)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:18,fontWeight:700,color:C.blk}}><span>Total</span><span>${total.toFixed(2)}</span></div>
          <div style={{display:"flex",gap:8,marginTop:16}}>
            <Btn v={hasSvc?"blue":"primary"} sz="lg" full ico={hasSvc?"clip":"$"} onClick={createOrder}>{hasSvc?"Create Order":"Complete Sale"}</Btn>
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn v="secondary" sz="sm" ico="print" sty={{flex:1}}>Print Receipt</Btn>
            <Btn v="ghost" sz="sm" onClick={()=>setCart([])}>Clear</Btn>
          </div>
        </div>}
      </Crd>
    </div>}

    {tab==="orders" && <div>
      {(() => {
        const statuses = ["Awaiting Clean","Washers","Dryers","Folding","Ready","On Hold"];
        return <div style={{display:"grid",gridTemplateColumns:`repeat(${statuses.length},1fr)`,gap:12}}>
          {statuses.map(st=>{const so=locOrders.filter(o=>o.status===st);return <div key={st}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,padding:"8px 12px",backgroundColor:OSTATUS[st]?.bg||C.lt,borderRadius:8}}>
              <span style={{fontSize:13,fontWeight:700,color:OSTATUS[st]?.tx||C.blk}}>{st}</span><Bdg c={OSTATUS[st]?.tx} sm>{so.length}</Bdg>
            </div>
            {so.map(o=>{const cu=customers.find(c=>c.id===o.cid);const isH=o.status==="On Hold";return <Crd key={o.id} onClick={()=>setOrderModal(o.id)} sty={{padding:12,cursor:"pointer",marginBottom:8,borderLeft:`3px solid ${isH?C.red:OSTATUS[st]?.tx||C.mid}`,backgroundColor:isH?"#FFF5F5":C.wh}}>
              <div style={{fontSize:12,fontWeight:700,color:C.blk,marginBottom:4}}>{o.id}{o.locked&&<Bdg c={C.grn} sm style={{marginLeft:6}}>🔒</Bdg>}</div>
              <div style={{fontSize:12,color:C.mid}}>{cu?custName(cu):""}</div>
              <div style={{fontSize:11,color:C.mid,marginTop:4}}>Due: {o.due||"N/A"}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.blk,marginTop:4}}>${o.total.toFixed(2)}</div>
              {isH&&<div style={{fontSize:11,color:C.red,marginTop:4,fontWeight:600}}>⚠ On Hold</div>}
            </Crd>;})}
          </div>;})}
        </div>;
      })()}
    </div>}

    {tab==="customers" && <div>
      <div style={{display:"flex",gap:12,marginBottom:16}}><SrchBar val={srch} set={setSrch} ph="Search customers..."/><Btn v="primary" ico="plus" onClick={()=>setNewCustModal(true)}>Add Customer</Btn></div>
      <Tbl cols={[
        {h:"Customer",r:r=><div style={{display:"flex",alignItems:"center",gap:10}}><Avt name={custName(r)} sz={28} c={r.biz?C.purp:C.blue}/><div><div style={{fontWeight:600}}>{custName(r)}</div>{r.biz&&<Bdg c={C.purp} sm>Business</Bdg>}</div></div>},
        {h:"Phone",k:"phone"},{h:"Email",k:"email"},
        {h:"Discount",r:r=><Bdg c={r.disc==="None"?C.mid:C.grn} sm>{r.disc}</Bdg>},
        {h:"Store Credit",r:r=><span style={{fontWeight:600,color:r.credit>0?C.grn:C.mid}}>${r.credit.toFixed(2)}</span>},
      ]} data={customers.filter(c=>!srch||custName(c).toLowerCase().includes(srch.toLowerCase()))}/>
    </div>}

    {tab==="products" && <div>
      <div style={{display:"flex",gap:12,marginBottom:16,justifyContent:"flex-end"}}><Btn v="primary" ico="plus" onClick={()=>setNewProdModal(true)}>Add Product</Btn></div>
      <Tbl cols={[
        {h:"Product",r:r=><span style={{fontWeight:600}}>{r.name}</span>},
        {h:"Category",r:r=>categories.find(c=>c.id===r.cat)?.name},
        {h:"Price",r:r=><span style={{fontWeight:600}}>${r.price.toFixed(2)} <span style={{fontSize:11,color:C.mid}}>/{r.mult==="pound"?"lb":"ea"}</span></span>},
        {h:"Type",r:r=><Bdg c={r.svc?C.blue:C.grn} sm>{r.svc?"Service":"Product"}</Bdg>},
        {h:"Inventory",r:r=>r.track?<span style={{fontWeight:600,color:r.inv<=r.min?C.red:C.blk}}>{r.inv} <span style={{fontSize:11,color:C.mid}}>min:{r.min}</span></span>:<span style={{color:C.mid}}>—</span>},
        {h:"Tax",r:r=>r.tax?<Bdg c={C.org} sm>Taxable</Bdg>:<span style={{color:C.mid}}>—</span>},
      ]} data={products}/>
    </div>}

    {tab==="invoices" && <div>
      <div style={{display:"flex",gap:12,marginBottom:16,justifyContent:"flex-end"}}><Btn v="primary" ico="mail">Generate Monthly Invoices</Btn></div>
      <Tbl cols={[
        {h:"Business Account",r:r=><div style={{display:"flex",alignItems:"center",gap:10}}><Avt name={custName(r)} sz={28} c={C.purp}/><span style={{fontWeight:600}}>{custName(r)}</span></div>},
        {h:"Email",k:"email"},{h:"Discount",r:r=><Bdg c={C.grn} sm>{r.disc}</Bdg>},
        {h:"Last Invoice",r:()=>"Mar 2026"},
        {h:"Outstanding",r:()=><span style={{fontWeight:600,color:C.red}}>$1,247.50</span>},
        {h:"Actions",r:()=><div style={{display:"flex",gap:4}}><Btn v="ghost" sz="sm" ico="eye">View</Btn><Btn v="ghost" sz="sm" ico="mail">Send</Btn></div>},
      ]} data={customers.filter(c=>c.biz)}/>
    </div>}

    {tab==="today" && <Crd>
      <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 16px",color:C.blk}}>Daily Cash Up Report — March 31, 2026</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {["Cash","Card","Laundroworks","Check","Store Credit"].map(t=>{const cnt=locOrders.filter(o=>o.payType===t).length;return <div key={t} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",backgroundColor:C.lt,borderRadius:8}}>
          <span style={{fontSize:13,fontWeight:600,color:C.blk}}>{t}</span><span style={{fontSize:13,color:C.mid}}>{cnt} transaction{cnt!==1?"s":""}</span>
        </div>;})}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"12px 14px",backgroundColor:C.blueLt,borderRadius:8,fontWeight:700,fontSize:14}}>
        <span>Total Transactions</span><span>{locOrders.length}</span>
      </div>
      <div style={{marginTop:12}}><Btn v="secondary" sz="sm" ico="print">Print Report</Btn></div>
    </Crd>}

    {/* Weight Popup */}
    {weightPopup&&<Modal title={`Enter Weight — ${weightPopup.name}`} onClose={()=>{setWeightPopup(null);setWeightVal("");}}>
      <Field label="Weight (lbs)"><Inp val={weightVal} set={setWeightVal} ph="e.g. 12.5" type="number"/></Field>
      {weightVal&&<div style={{fontSize:14,fontWeight:600,color:C.blk,marginBottom:12}}>Total: ${(weightPopup.price*parseFloat(weightVal||0)).toFixed(2)}</div>}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn v="secondary" onClick={()=>{setWeightPopup(null);setWeightVal("");}}>Cancel</Btn>
        <Btn v="primary" onClick={()=>{const w=parseFloat(weightVal);if(!w||w<=0)return;setCart([...cart,{pid:weightPopup.id,name:weightPopup.name,price:weightPopup.price,qty:w,mult:"pound",svc:!!weightPopup.svc}]);setWeightPopup(null);setWeightVal("");}}>Add to Order</Btn>
      </div>
    </Modal>}

    {/* Modals */}
    {custModal&&<Modal title="Select Customer" onClose={()=>setCustModal(false)}>
      <SrchBar val={srch} set={setSrch} ph="Search by name, phone, or email..."/>
      <div style={{marginTop:16}}>{customers.filter(c=>!srch||custName(c).toLowerCase().includes(srch.toLowerCase())||c.phone.includes(srch)||c.email.toLowerCase().includes(srch.toLowerCase())).map(c=><div key={c.id} onClick={()=>{setSelCust(c);setCustModal(false);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderBottom:"1px solid #F3F4F6",cursor:"pointer",borderRadius:8}} onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.lt} onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><Avt name={custName(c)} c={c.biz?C.purp:C.blue}/><div><div style={{fontSize:13,fontWeight:600}}>{custName(c)}</div><div style={{fontSize:12,color:C.mid}}>{c.phone} • {c.email}</div></div></div>
        <div style={{textAlign:"right"}}>{c.biz&&<Bdg c={C.purp} sm>Business</Bdg>}{c.credit>0&&<div style={{fontSize:11,color:C.grn,marginTop:2}}>${c.credit.toFixed(2)} credit</div>}</div>
      </div>)}</div>
      <div style={{marginTop:16}}><Btn v="secondary" ico="plus" full onClick={()=>{setCustModal(false);setNewCustModal(true);}}>Add New Customer</Btn></div>
    </Modal>}

    {orderModal&&(()=>{const _C=()=>{
      const o=orders.find(x=>x.id===orderModal); if(!o)return null;
      const cu=customers.find(c=>c.id===o.cid);
      const allStatuses=["Awaiting Clean","Washers","Dryers","Folding","Ready","On Hold"];
      const [showReadyConfirm,setShowReadyConfirm]=useState(false);
      const [showCancelPrompt,setShowCancelPrompt]=useState(false);
      const [cancelReason,setCancelReason]=useState("");
      const [editing,setEditing]=useState(false);
      const [editItems,setEditItems]=useState(o.items?.map(i=>({...i}))||[]);
      const advance=(newSt)=>{
        if(o.locked)return;
        if(newSt==="Ready"){setShowReadyConfirm(true);return;}
        setOrders(orders.map(x=>x.id===o.id?{...x,status:newSt,hist:[...x.hist,{s:newSt,t:now(),u:user.name}]}:x));setOrderModal(null);
      };
      const confirmReady=()=>{setOrders(orders.map(x=>x.id===o.id?{...x,status:"Ready",locked:true,hist:[...x.hist,{s:"Ready (locked)",t:now(),u:user.name}]}:x));setOrderModal(null);};
      const confirmCancel=()=>{if(!cancelReason.trim())return;setOrders(orders.map(x=>x.id===o.id?{...x,status:"Cancelled",hist:[...x.hist,{s:`Cancelled — ${cancelReason}`,t:now(),u:user.name}]}:x));setOrderModal(null);};
      const saveEdit=()=>{setOrders(orders.map(x=>x.id===o.id?{...x,items:editItems,total:editItems.reduce((s,i)=>{const p=products.find(pp=>pp.id===i.pid);return s+(p?p.price*i.qty:0);},0),hist:[...x.hist,{s:"Order edited",t:now(),u:user.name}]}:x));setEditing(false);};
      return <Modal title={`Order ${o.id}`} onClose={()=>setOrderModal(null)} w="640px">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          <div><div style={{fontSize:11,color:C.mid,textTransform:"uppercase",marginBottom:4}}>Customer</div><div style={{fontSize:14,fontWeight:600,color:C.blk}}>{cu?custName(cu):""}</div><div style={{fontSize:12,color:C.mid}}>{cu?.phone}</div></div>
          <div><div style={{fontSize:11,color:C.mid,textTransform:"uppercase",marginBottom:4}}>Status</div><SBdg status={o.status} map={OSTATUS}/>{o.locked&&<Bdg c={C.grn} sm style={{marginLeft:6}}>🔒 Locked</Bdg>}</div>
          <div><div style={{fontSize:11,color:C.mid,textTransform:"uppercase",marginBottom:4}}>Due Date</div><div style={{fontSize:14,fontWeight:600,color:C.blk}}>{o.due||"N/A"}</div></div>
          <div><div style={{fontSize:11,color:C.mid,textTransform:"uppercase",marginBottom:4}}>Total</div><div style={{fontSize:18,fontWeight:700,color:C.blk}}>${o.total.toFixed(2)}</div></div>
        </div>
        {o.hold&&<div style={{padding:"12px 16px",backgroundColor:"#FFF5F5",borderRadius:8,borderLeft:`3px solid ${C.red}`,marginBottom:20}}><div style={{fontSize:12,fontWeight:600,color:C.red,marginBottom:4}}>Hold Reason</div><div style={{fontSize:13,color:C.blk}}>{o.hold}</div></div>}

        {/* Edit Items */}
        {editing&&!o.locked&&<div style={{padding:16,backgroundColor:C.lt,borderRadius:8,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Edit Order Items</div>
          {editItems.map((it,i)=>{const p=products.find(pp=>pp.id===it.pid);return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{flex:1,fontSize:13}}>{p?.name||"Item"}</span>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:11,color:C.mid}}>{it.u==="lbs"?"lbs":"qty"}:</span>
              <input type="number" value={it.qty} onChange={e=>{const ni=[...editItems];ni[i]={...ni[i],qty:Math.max(0.5,parseFloat(e.target.value)||0)};setEditItems(ni);}} style={{width:60,padding:"4px 6px",border:"1px solid #ddd",borderRadius:4,fontSize:12}}/>
            </div>
          </div>;})}
          <div style={{display:"flex",gap:6,marginTop:8}}><Btn v="primary" sz="sm" onClick={saveEdit}>Save Changes</Btn><Btn v="ghost" sz="sm" onClick={()=>setEditing(false)}>Cancel</Btn></div>
        </div>}

        <div style={{marginBottom:20}}><div style={{fontSize:13,fontWeight:700,color:C.blk,marginBottom:12}}>Order Timeline</div>{o.hist.map((h,i)=><div key={i} style={{display:"flex",gap:12,marginBottom:12}}><div style={{width:8,height:8,borderRadius:"50%",backgroundColor:OSTATUS[h.s]?.tx||C.mid,marginTop:6,flexShrink:0}}/><div><div style={{fontSize:13,fontWeight:600,color:C.blk}}>{h.s}</div><div style={{fontSize:12,color:C.mid}}>{h.u} • {h.t}</div></div></div>)}</div>

        {/* Ready Confirmation */}
        {showReadyConfirm&&<div style={{padding:16,backgroundColor:"#FFF9C4",borderRadius:8,borderLeft:`3px solid ${C.org}`,marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:700,color:"#F57F17",marginBottom:8}}>⚠ Has this order been double-checked and is accurate?</div>
          <div style={{fontSize:12,color:C.mid,marginBottom:12}}>Once marked Ready, this order will be locked and cannot be edited.</div>
          <div style={{display:"flex",gap:8}}><Btn v="green" sz="sm" ico="tick" onClick={confirmReady}>Yes, Mark Ready</Btn><Btn v="ghost" sz="sm" onClick={()=>setShowReadyConfirm(false)}>Cancel</Btn></div>
        </div>}

        {/* Cancel Prompt */}
        {showCancelPrompt&&<div style={{padding:16,backgroundColor:"#FFF5F5",borderRadius:8,borderLeft:`3px solid ${C.red}`,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:8}}>Reason for Cancellation *</div>
          <Txta val={cancelReason} set={setCancelReason} ph="Enter reason..." rows={2}/>
          <div style={{display:"flex",gap:8,marginTop:8}}><Btn v="primary" sz="sm" onClick={confirmCancel} disabled={!cancelReason.trim()}>Confirm Cancel</Btn><Btn v="ghost" sz="sm" onClick={()=>setShowCancelPrompt(false)}>Back</Btn></div>
        </div>}

        {!showReadyConfirm&&!showCancelPrompt&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {!o.locked&&allStatuses.filter(s=>s!==o.status).map(s=><Btn key={s} v={s==="Ready"?"green":s==="On Hold"?"secondary":"blue"} sz="sm" onClick={()=>advance(s)}>→ {s}</Btn>)}
          {!o.locked&&o.status!=="Cancelled"&&<Btn v="secondary" sz="sm" ico="alert" onClick={()=>setShowCancelPrompt(true)}>Cancel Order</Btn>}
          {!o.locked&&<Btn v="ghost" sz="sm" ico="edit" onClick={()=>setEditing(true)}>Edit Order</Btn>}
          <Btn v="secondary" ico="print" sz="sm">Print Receipt</Btn>
        </div>}
      </Modal>;
      };return <_C/>;})()}

    {newCustModal&&(()=>{const _C=()=>{
      const [f,sF]=useState("");const[l,sL]=useState("");const[ph,sPh]=useState("");const[em,sEm]=useState("");const[d,sD]=useState("None");const[n,sN]=useState("");const[b,sB]=useState(false);
      const save=()=>{if(!f||!l)return;setCustomers([...customers,{id:customers.length+1,first:f,last:l,phone:ph,email:em,disc:d,notes:n,biz:b,credit:0}]);setNewCustModal(false);};
      return <Modal title="Add New Customer" onClose={()=>setNewCustModal(false)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="First Name"><Inp val={f} set={sF} ph="First name"/></Field>
          <Field label="Last Name"><Inp val={l} set={sL} ph="Last name"/></Field>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Phone"><Inp val={ph} set={sPh} ph="515-555-0000"/></Field>
          <Field label="Email"><Inp val={em} set={sEm} ph="email@example.com"/></Field>
        </div>
        <Field label="Discount"><Sel val={d} set={sD} opts={DISCOUNTS.map(x=>({v:x.name,l:x.name}))}/></Field>
        <Field label="Private Notes"><Txta val={n} set={sN} ph="Internal notes about this customer..."/></Field>
        <Field label=""><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={b} onChange={e=>sB(e.target.checked)}/> Business Account</label></Field>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setNewCustModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Save Customer</Btn></div>
      </Modal>;
      };return <_C/>;})()}

    {newProdModal&&(()=>{const _C=()=>{
      const [nm,sNm]=useState("");const[cat,sCat]=useState("");const[pr,sPr]=useState("");const[mt,sMt]=useState("piece");const[tr,sTr]=useState(false);const[mn,sMn]=useState("");const[tx,sTx]=useState(false);const[sv,sSv]=useState(false);
      const save=()=>{if(!nm||!cat||!pr)return;setProducts([...products,{id:products.length+1,name:nm,cat:+cat,price:+pr,mult:mt,track:tr,inv:tr?50:undefined,min:tr?+mn:undefined,tax:tx,svc:sv}]);setNewProdModal(false);};
      return <Modal title="Add New Product/Service" onClose={()=>setNewProdModal(false)}>
        <Field label="Name"><Inp val={nm} set={sNm} ph="Product or service name"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Category"><Sel val={cat} set={sCat} opts={categories.map(c=>({v:c.id,l:c.name}))} ph="Select category"/></Field>
          <Field label="Price"><Inp val={pr} set={sPr} ph="0.00" type="number"/></Field>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Pricing Type"><Sel val={mt} set={sMt} opts={[{v:"piece",l:"Per Piece"},{v:"pound",l:"Per Pound"}]}/></Field>
          <Field label="Min Stock (if tracked)"><Inp val={mn} set={sMn} ph="10" type="number"/></Field>
        </div>
        <div style={{display:"flex",gap:20,marginBottom:16}}>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={sv} onChange={e=>sSv(e.target.checked)}/> Service</label>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={tr} onChange={e=>sTr(e.target.checked)}/> Track Inventory</label>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={tx} onChange={e=>sTx(e.target.checked)}/> Taxable</label>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setNewProdModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Save Product</Btn></div>
      </Modal>;
      };return <_C/>;})()}
  </div>;
};

/* ============================================================
   TASKS MODULE
   ============================================================ */
const Tasks = () => {
  const {user,tasks,setTasks,selectedLoc:loc,locations} = useApp();
  const locTasks = tasks[loc]||[];
  const canEdit = !["Attendant"].includes(user.role); // user-specific permission (simplified for demo)
  const myTasks = locTasks.filter(t=>t.day==="Monday"&&(t.role==="All"||t.role===user.role));
  const [addModal,setAddModal] = useState(false);

  const toggle = (id) => setTasks({...tasks,[loc]:locTasks.map(t=>t.id===id?{...t,done:!t.done,doneBy:!t.done?user.name:null,doneAt:!t.done?now():null}:t)});
  const done = myTasks.filter(t=>t.done).length; const tot = myTasks.length; const pct = tot?Math.round(done/tot*100):0;

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Tasks</h2><p style={{fontSize:13,color:C.mid,margin:"4px 0 0"}}>Monday's tasks — {locations.find(l=>l.id===loc)?.name}</p></div>
      {canEdit&&<Btn v="primary" ico="plus" onClick={()=>setAddModal(true)}>Add Task</Btn>}
    </div>
    <Crd sty={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:13,fontWeight:600,color:C.blk}}>{done} of {tot} tasks completed</span>
        <span style={{fontSize:13,fontWeight:700,color:pct===100?C.grn:C.blue}}>{pct}%</span>
      </div>
      <div style={{height:8,backgroundColor:C.lt,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,backgroundColor:pct===100?C.grn:C.blue,borderRadius:4,transition:"width .3s"}}/></div>
    </Crd>
    <Crd>{myTasks.map((t,i)=>{
      const overdue = !t.done; // simplified for demo
      return <div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 0",borderBottom:i<myTasks.length-1?"1px solid #F3F4F6":"none"}}>
        <button onClick={()=>toggle(t.id)} style={{width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,border:t.done?"none":"2px solid #D1D5DB",backgroundColor:t.done?C.grn:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{t.done&&<Ico d={ICONS.tick} sz={14} c={C.wh}/>}</button>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:500,color:t.done?C.mid:C.blk,textDecoration:t.done?"line-through":"none"}}>{t.text} {t.role!=="All"&&<Bdg c={C.purp} sm>{t.role}</Bdg>}</div>
          <div style={{fontSize:12,color:C.mid,marginTop:4}}>Due by {t.time}{t.done&&t.doneBy?` • Done by ${t.doneBy} at ${t.doneAt}`:""}</div>
        </div>
      </div>;
    })}</Crd>

    {addModal&&(()=>{const _C=()=>{
      const [txt,sTxt]=useState("");const[tm,sTm]=useState("09:00 AM");const[rl,sRl]=useState("All");const[dy,sDy]=useState("Monday");
      const save=()=>{if(!txt)return;const nt={id:Date.now(),text:txt,day:dy,time:tm,role:rl,done:false};setTasks({...tasks,[loc]:[...(tasks[loc]||[]),nt]});setAddModal(false);};
      return <Modal title="Add Task" onClose={()=>setAddModal(false)}>
        <Field label="Task Description"><Inp val={txt} set={sTxt} ph="Enter task description"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <Field label="Day"><Sel val={dy} set={sDy} opts={["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=>({v:d,l:d}))}/></Field>
          <Field label="Due By"><Inp val={tm} set={sTm} ph="09:00 AM"/></Field>
          <Field label="Assign to Role"><Sel val={rl} set={sRl} opts={[{v:"All",l:"All"},...ROLES.map(r=>({v:r,l:r}))]}/></Field>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setAddModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Add Task</Btn></div>
      </Modal>;
      };return <_C/>;})()}
  </div>;
};

/* ============================================================
   MAINTENANCE MODULE
   ============================================================ */
const Maint = () => {
  const {selectedLoc:loc,maint,setMaint,user,users,locations} = useApp();
  const [tab,setTab] = useState("dash");
  const [newModal,setNewModal] = useState(false);
  const [detailId,setDetailId] = useState(null);
  const isML = user.locations.length>1;
  const locR = maint.filter(m=>m.loc===loc);
  const active = locR.filter(m=>m.status!=="Fixed");
  const tabs=[{id:"dash",l:"Dashboard"},{id:"req",l:"Active Requests",n:active.length},{id:"equip",l:"Equipment"},{id:"parts",l:"Parts Inventory"},...(isML?[{id:"over",l:"Multi-Location"}]:[])];
  const machines = initMachines(loc);

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Maintenance</h2>
      <Btn v="primary" ico="plus" onClick={()=>setNewModal(true)}>New Request</Btn>
    </div>
    <TabB tabs={tabs} act={tab} set={setTab}/>

    {tab==="dash"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:24}}>
        <Stat label="Active Issues" value={active.length} ico="alert" c={C.red}/>
        <Stat label="Parts Ordered" value={active.filter(r=>r.status==="Parts Ordered").length} ico="pkg" c={C.org}/>
        <Stat label="Awaiting Inspection" value={active.filter(r=>!r.techBy).length} ico="eye" c={C.blue}/>
        <Stat label="Resolved This Month" value={maint.filter(r=>r.status==="Fixed").length} ico="tick" c={C.grn}/>
      </div>
      <Crd><h3 style={{fontSize:15,fontWeight:700,margin:"0 0 16px",color:C.blk}}>Machine Status — {locations.find(l=>l.id===loc)?.name}</h3>
        {["washers","dryers"].map(type=><div key={type} style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:C.mid,marginBottom:8,textTransform:"uppercase"}}>{type}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {machines[type].map(m=>{const dn=m.status==="down";const mr=maint.find(x=>x.eqNum===m.id&&x.status!=="Fixed");return <div key={m.id} title={`${m.id}${dn?" — DOWN":""}`} onClick={()=>{if(mr){setDetailId(mr.id);}else if(dn){/* already down but no request */}else{setNewModal(true);}}} style={{width:40,height:40,borderRadius:8,backgroundColor:dn?"#FFCDD2":"#C8E6C9",color:dn?C.red:C.grn,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,cursor:"pointer",border:dn?`2px solid ${C.red}`:"1px solid #A5D6A7"}}>{m.id}</div>;})}
          </div>
        </div>)}
      </Crd>
    </div>}

    {tab==="req"&&<Tbl cols={[
      {h:"ID",r:r=><span style={{fontWeight:700,fontFamily:"monospace"}}>{r.id}</span>},
      {h:"Equipment",r:r=><span style={{fontWeight:600}}>{r.eqType} {r.eqNum}</span>},
      {h:"Severity",r:r=>{const s=SEV[r.sev];return <Bdg c={s?.tx} bg={s?.bg}>{r.sev}</Bdg>;}},
      {h:"Reason",k:"reason"},
      {h:"Status",r:r=><Bdg c={C.blue}>{r.status}</Bdg>},
      {h:"Reported",r:r=><span style={{fontSize:12,color:C.mid}}>{r.repAt}</span>},
      {h:"By",k:"repBy"},
    ]} data={active} onRow={r=>setDetailId(r.id)}/>}

    {tab==="equip"&&<Tbl cols={[
      {h:"ID",r:r=><span style={{fontWeight:700,fontFamily:"monospace"}}>{r.id}</span>},
      {h:"Type",r:r=>r.type},
      {h:"Status",r:r=><Bdg c={r.status==="down"?C.red:C.grn} bg={r.status==="down"?"#FFCDD2":"#C8E6C9"}>{r.status==="down"?"Down":"Operational"}</Bdg>},
    ]} data={[...machines.washers,...machines.dryers]}/>}

    {tab==="parts"&&<div style={{textAlign:"center",padding:60,color:C.mid}}><Ico d={ICONS.pkg} sz={48} c={C.mid}/><div style={{fontSize:16,fontWeight:600,marginTop:12}}>Central Parts Inventory</div><div style={{fontSize:13,marginTop:6}}>Track replacement parts, vendors, and costs across all locations.</div></div>}

    {tab==="over"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
      {locations.map(l=>{const reqs=maint.filter(m=>m.loc===l.id&&m.status!=="Fixed");const cnt=reqs.length;const avgN=reqs.length?reqs.reduce((s,r)=>s+(r.sev==="Critical"?4:r.sev==="High"?3:r.sev==="Medium"?2:1),0)/reqs.length:0;const lbl=avgN>=3.5?"Critical":avgN>=2.5?"High":avgN>=1.5?"Medium":avgN>0?"Low":"None";
        return <Crd key={l.id}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:8}}><Ico d={ICONS.pin} sz={16} c={C.mid}/><span style={{fontSize:15,fontWeight:700,color:C.blk}}>{l.name}</span></div>{cnt>0&&<Bdg c={SEV[lbl]?.tx||C.mid} bg={SEV[lbl]?.bg}>{lbl}</Bdg>}</div><div style={{fontSize:28,fontWeight:700,color:cnt>0?C.red:C.grn}}>{cnt}<span style={{fontSize:13,fontWeight:400,color:C.mid,marginLeft:6}}>machines down</span></div></Crd>;
      })}
    </div>}

    {newModal&&(()=>{const _C=()=>{
      const [et,sEt]=useState("Washer");const[en,sEn]=useState("");const[sv,sSv]=useState("Medium");const[rs,sRs]=useState("");
      const save=()=>{if(!en||!rs)return;setMaint([{id:`MR-${nid()}`,loc,eqType:et,eqNum:en,sev:sv,reason:rs,status:"Needs Diagnostics",repBy:user.name,repAt:now(),techBy:null,techAt:null,notes:"",parts:[],remedy:null},...maint]);setNewModal(false);};
      return <Modal title="New Maintenance Request" onClose={()=>setNewModal(false)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Equipment Type"><Sel val={et} set={sEt} opts={[{v:"Washer",l:"Washer"},{v:"Dryer",l:"Dryer"},{v:"VAC",l:"VAC"},{v:"HVAC Unit",l:"HVAC Unit"},{v:"Water Heater",l:"Water Heater"},{v:"Misc",l:"Misc"}]}/></Field>
          <Field label="Equipment Number"><Inp val={en} set={sEn} ph="e.g. W6, D12"/></Field>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Severity"><Sel val={sv} set={sSv} opts={["Critical","High","Medium","Low"].map(s=>({v:s,l:s}))}/></Field>
          <Field label="Reason for Repair"><Sel val={rs} set={sRs} opts={["Leaking water","Not spinning","Not heating","Noisy during spin","Error code","Door latch broken","Control panel issue","Other"].map(s=>({v:s,l:s}))} ph="Select reason"/></Field>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}><Btn v="secondary" onClick={()=>setNewModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Submit Request</Btn></div>
      </Modal>;
      };return <_C/>;})()}

    {detailId&&(()=>{const _C=()=>{
      const r=maint.find(m=>m.id===detailId);if(!r)return null;
      const [addNote,setAddNote]=useState("");
      const [partsInfo,setPartsInfo]=useState("");
      const [repairDetail,setRepairDetail]=useState("");
      const [showPartsPrompt,setShowPartsPrompt]=useState(false);
      const [showFixPrompt,setShowFixPrompt]=useState(false);
      const updateSt=(st)=>{setMaint(maint.map(m=>m.id===r.id?{...m,status:st}:m));setDetailId(null);};
      const saveNote=()=>{if(!addNote.trim())return;setMaint(maint.map(m=>m.id===r.id?{...m,notes:m.notes+(m.notes?"\n":"")+`[${now()} — ${user.name}] ${addNote}`}:m));setAddNote("");};
      return <Modal title={`${r.id} — ${r.eqType} ${r.eqNum}`} onClose={()=>setDetailId(null)} w="640px">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20}}>
          <div><div style={{fontSize:11,color:C.mid,textTransform:"uppercase",marginBottom:4}}>Status</div><Bdg c={C.blue}>{r.status}</Bdg></div>
          <div><div style={{fontSize:11,color:C.mid,textTransform:"uppercase",marginBottom:4}}>Severity</div><Bdg c={SEV[r.sev]?.tx} bg={SEV[r.sev]?.bg}>{r.sev}</Bdg></div>
          <div><div style={{fontSize:11,color:C.mid,textTransform:"uppercase",marginBottom:4}}>Reported</div><div style={{fontSize:13}}>{r.repBy} — {r.repAt}</div></div>
        </div>
        <div style={{fontSize:13,color:C.blk,marginBottom:16}}><strong>Reason:</strong> {r.reason}</div>
        {r.notes&&<div style={{fontSize:13,color:C.blk,marginBottom:16,whiteSpace:"pre-wrap"}}><strong>Notes:</strong> {r.notes}</div>}
        {r.techBy&&<div style={{fontSize:13,color:C.blk,marginBottom:16}}><strong>Inspected by:</strong> {r.techBy} on {r.techAt}</div>}
        {r.parts.length>0&&<div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Parts</div>{r.parts.map((p,i)=><div key={i} style={{padding:"8px 12px",backgroundColor:C.lt,borderRadius:6,marginBottom:4,fontSize:13}}>{p.name} — {p.vendor} — ${p.cost} — Est: {p.est}{p.act?` — Delivered: ${p.act}`:""}</div>)}</div>}
        {r.remedy&&<div style={{fontSize:13,color:C.grn,marginBottom:16}}><strong>Remedy:</strong> {r.remedy}</div>}

        {/* Add Note — always available */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",gap:6}}>
            <Inp val={addNote} set={setAddNote} ph="Add a note..."/>
            <Btn v="secondary" sz="sm" onClick={saveNote} disabled={!addNote.trim()}>Add Note</Btn>
          </div>
        </div>

        {/* Parts Ordered Prompt */}
        {showPartsPrompt&&<div style={{padding:12,backgroundColor:C.yelLt,borderRadius:8,marginBottom:12}}>
          <Field label="Parts Information"><Txta val={partsInfo} set={setPartsInfo} ph="What parts were ordered? Vendor? ETA?" rows={2}/></Field>
          <div style={{display:"flex",gap:6}}><Btn v="primary" sz="sm" onClick={()=>{if(partsInfo.trim()){setMaint(maint.map(m=>m.id===r.id?{...m,status:"Parts Ordered",notes:m.notes+(m.notes?"\n":"")+`[${now()} — ${user.name}] Parts: ${partsInfo}`}:m));}else{updateSt("Parts Ordered");}setShowPartsPrompt(false);setDetailId(null);}}>Confirm</Btn><Btn v="ghost" sz="sm" onClick={()=>setShowPartsPrompt(false)}>Cancel</Btn></div>
        </div>}

        {/* Fixed Prompt */}
        {showFixPrompt&&<div style={{padding:12,backgroundColor:C.grnLt,borderRadius:8,marginBottom:12}}>
          <Field label="Repair Details"><Txta val={repairDetail} set={setRepairDetail} ph="Describe the repair performed..." rows={2}/></Field>
          <div style={{display:"flex",gap:6}}><Btn v="green" sz="sm" ico="tick" onClick={()=>{setMaint(maint.map(m=>m.id===r.id?{...m,status:"Fixed",remedy:repairDetail||"Repaired and returned to service",fixAt:now(),notes:m.notes+(m.notes?"\n":"")+`[${now()} — ${user.name}] Fixed: ${repairDetail}`}:m));setShowFixPrompt(false);setDetailId(null);}}>Confirm Fixed</Btn><Btn v="ghost" sz="sm" onClick={()=>setShowFixPrompt(false)}>Cancel</Btn></div>
        </div>}

        {/* All status options available at any time */}
        {!showPartsPrompt&&!showFixPrompt&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {r.status!=="Needs Diagnostics"&&<Btn v="secondary" sz="sm" onClick={()=>updateSt("Needs Diagnostics")}>Needs Diagnostics</Btn>}
          {r.status!=="Inspected"&&<Btn v="blue" sz="sm" onClick={()=>updateSt("Inspected")}>Inspected</Btn>}
          {r.status!=="Parts Ordered"&&<Btn v="secondary" sz="sm" onClick={()=>setShowPartsPrompt(true)}>Parts Ordered</Btn>}
          {r.status!=="Fixed"&&<Btn v="green" sz="sm" ico="tick" onClick={()=>setShowFixPrompt(true)}>Mark Fixed</Btn>}
        </div>}
      </Modal>;
      };return <_C/>;})()}
  </div>;
};

/* ============================================================
   COMMUNICATION MODULE
   ============================================================ */
const Comm = () => {
  const {user,users,msgs,setMsgs,groups,setGroups} = useApp();
  const [tab,setTab] = useState("inbox");
  const [selMsg,setSelMsg] = useState(null);
  const [reply,setReply] = useState("");
  const [newModal,setNewModal] = useState(false);
  const [selGroup,setSelGroup] = useState(null);
  const [grpMsg,setGrpMsg] = useState("");
  const inbox = msgs.filter(m=>m.to.includes(user.id)&&!m.archived?.[user.id]);
  const archived = msgs.filter(m=>m.to.includes(user.id)&&m.archived?.[user.id]);
  const sent = msgs.filter(m=>m.from===user.id);
  const unread = inbox.filter(m=>!m.read[user.id]).length;
  const tabs=[{id:"inbox",l:"Inbox",n:unread},{id:"archived",l:"Archived"},{id:"sent",l:"Sent"},{id:"groups",l:"Groups"},{id:"dir",l:"Directory"}];

  const sendReply = () => {
    if(!reply.trim()||!selMsg)return;
    const nm={id:msgs.length+1,from:user.id,to:[selMsg.from],subj:`Re: ${selMsg.subj}`,body:reply,ts:now(),read:{}};
    setMsgs([nm,...msgs]);setReply("");
  };

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Communication</h2>
      <Btn v="primary" ico="edit" onClick={()=>setNewModal(true)}>New Message</Btn>
    </div>
    <TabB tabs={tabs} act={tab} set={setTab}/>

    {tab==="inbox"&&!selMsg&&inbox.map(m=>{const s=users.find(u=>u.id===m.from);const ur=!m.read[user.id];
      return <div key={m.id} onClick={()=>{setSelMsg(m);setMsgs(msgs.map(x=>x.id===m.id?{...x,read:{...x.read,[user.id]:true}}:x));}} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",borderBottom:"1px solid #F3F4F6",cursor:"pointer",borderRadius:8,backgroundColor:ur?"#F0F7FF":"transparent"}}>
        <Avt name={s?.name||""} sz={36} c={ur?C.blue:C.mid}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:13,fontWeight:ur?700:500,color:C.blk}}>{s?.name}</span><span style={{fontSize:11,color:C.mid}}>{m.ts}</span></div>
          <div style={{fontSize:13,fontWeight:ur?700:500,color:C.blk,marginBottom:2}}>{m.subj}</div>
          <div style={{fontSize:12,color:C.mid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.body}</div>
        </div>
        {ur&&<div style={{width:8,height:8,borderRadius:"50%",backgroundColor:C.blue,flexShrink:0,marginTop:6}}/>}
      </div>;
    })}

    {tab==="inbox"&&selMsg&&<div>
      <button onClick={()=>setSelMsg(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.mid,marginBottom:16,fontFamily:"inherit"}}><Ico d={ICONS.back} sz={16}/> Back</button>
      <Crd>
        <h3 style={{fontSize:17,fontWeight:700,color:C.blk,margin:"0 0 8px"}}>{selMsg.subj}</h3>
        <div style={{display:"flex",alignItems:"center",gap:10}}><Avt name={users.find(u=>u.id===selMsg.from)?.name||""} sz={32} c={C.blue}/><div><div style={{fontSize:13,fontWeight:600}}>{users.find(u=>u.id===selMsg.from)?.name}</div><div style={{fontSize:11,color:C.mid}}>{selMsg.ts}</div></div></div>
        <div style={{fontSize:11,color:C.mid,marginTop:8}}>To: {selMsg.to.map(id=>users.find(u=>u.id===id)?.name).join(", ")}</div>
        <div style={{fontSize:14,lineHeight:1.6,color:C.blk,padding:"16px 0",borderTop:"1px solid #F3F4F6",marginTop:12}}>{selMsg.body}</div>
        <div style={{borderTop:"1px solid #F3F4F6",paddingTop:12}}>
          <div style={{fontSize:11,fontWeight:600,color:C.mid,marginBottom:6,textTransform:"uppercase"}}>Read & Acknowledge Status</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{selMsg.to.map(id=>{const u=users.find(u=>u.id===id);const rd=selMsg.read[id];const ack=selMsg.acknowledged?.[id];return <div key={id} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:rd?C.grn:C.mid}}><div style={{width:6,height:6,borderRadius:"50%",backgroundColor:rd?C.grn:"#D1D5DB"}}/>{u?.name}{rd?" ✓ Read":""}{ack?" ✓ Ack":""}</div>;})}</div>
        </div>
        {/* Acknowledge + Archive buttons */}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          {selMsg.from!==user.id&&!selMsg.acknowledged?.[user.id]&&<Btn v="green" sz="sm" ico="tick" onClick={()=>{setMsgs(msgs.map(m=>m.id===selMsg.id?{...m,acknowledged:{...(m.acknowledged||{}),[user.id]:true}}:m));setSelMsg({...selMsg,acknowledged:{...(selMsg.acknowledged||{}),[user.id]:true}});}}>Acknowledge</Btn>}
          {selMsg.from!==user.id&&selMsg.acknowledged?.[user.id]&&<Bdg c={C.grn}>✓ Acknowledged</Bdg>}
          <Btn v="secondary" sz="sm" onClick={()=>{setMsgs(msgs.map(m=>m.id===selMsg.id?{...m,archived:{...(m.archived||{}),[user.id]:true}}:m));setSelMsg(null);}}>Archive</Btn>
        </div>
        <div style={{marginTop:20,display:"flex",gap:8}}>
          <input value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..." style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,fontFamily:"inherit",outline:"none"}} onKeyDown={e=>e.key==="Enter"&&sendReply()}/>
          <Btn v="ghost" ico="att" sz="sm"/>
          <Btn v="primary" ico="send" sz="sm" onClick={sendReply}>Send</Btn>
        </div>
      </Crd>
    </div>}

    {tab==="archived"&&(archived.length===0?<div style={{textAlign:"center",padding:60,color:C.mid}}><Ico d={ICONS.chat} sz={48} c={C.mid}/><div style={{fontSize:16,fontWeight:600,marginTop:12}}>No Archived Messages</div></div>
      :archived.map(m=>{const s=users.find(u=>u.id===m.from);return <div key={m.id} onClick={()=>{setSelMsg(m);setTab("inbox");}} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",borderBottom:"1px solid #F3F4F6",cursor:"pointer",borderRadius:8}}>
        <Avt name={s?.name||""} sz={36} c={C.mid}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:13,fontWeight:500,color:C.blk}}>{s?.name}</span><span style={{fontSize:11,color:C.mid}}>{m.ts}</span></div>
          <div style={{fontSize:13,fontWeight:500,color:C.blk,marginBottom:2}}>{m.subj}</div>
          <div style={{fontSize:12,color:C.mid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.body}</div>
        </div>
      </div>;}
    ))}

    {tab==="sent"&&sent.map(m=><div key={m.id} style={{padding:"14px 16px",borderBottom:"1px solid #F3F4F6"}}><div style={{fontSize:13,fontWeight:600,color:C.blk,marginBottom:2}}>{m.subj}</div><div style={{fontSize:12,color:C.mid}}>To: {m.to.map(id=>users.find(u=>u.id===id)?.name).join(", ")} • {m.ts}</div></div>)}

    {tab==="groups"&&!selGroup&&<div>
      {user.role==="Administrator"&&<div style={{marginBottom:16}}><Btn v="primary" ico="plus">Create Group</Btn></div>}
      {groups.filter(g=>g.members.includes(user.id)).map(g=><Crd key={g.id} onClick={()=>setSelGroup(g)} sty={{marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:10,backgroundColor:`${C.blue}14`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico d={ICONS.ppl} sz={20} c={C.blue}/></div><div><div style={{fontSize:14,fontWeight:600,color:C.blk}}>{g.name}</div><div style={{fontSize:12,color:C.mid}}>{g.members.length} members</div></div></div>
        <Ico d={ICONS.chvR} sz={16} c={C.mid}/>
      </Crd>)}
    </div>}

    {tab==="groups"&&selGroup&&<div>
      <button onClick={()=>setSelGroup(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.mid,marginBottom:16,fontFamily:"inherit"}}><Ico d={ICONS.back} sz={16}/> Back</button>
      <Crd>
        <h3 style={{fontSize:17,fontWeight:700,color:C.blk,margin:"0 0 16px"}}>{selGroup.name}</h3>
        <div style={{minHeight:200,marginBottom:16}}>
          {(selGroup.msgs||[]).map((m,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:12}}>
            <Avt name={users.find(u=>u.id===m.from)?.name||""} sz={28} c={C.blue}/>
            <div><div style={{fontSize:12,fontWeight:600}}>{users.find(u=>u.id===m.from)?.name}<span style={{fontWeight:400,color:C.mid,marginLeft:8}}>{m.ts}</span></div><div style={{fontSize:13,marginTop:2}}>{m.body}</div></div>
          </div>)}
          {(!selGroup.msgs||selGroup.msgs.length===0)&&<div style={{textAlign:"center",padding:40,color:C.mid,fontSize:13}}>No messages yet</div>}
        </div>
        <div style={{display:"flex",gap:8,borderTop:"1px solid #E5E7EB",paddingTop:12}}>
          <input value={grpMsg} onChange={e=>setGrpMsg(e.target.value)} placeholder="Type a message..." style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,fontFamily:"inherit",outline:"none"}} onKeyDown={e=>{if(e.key==="Enter"&&grpMsg.trim()){setGroups(groups.map(g=>g.id===selGroup.id?{...g,msgs:[...(g.msgs||[]),{from:user.id,body:grpMsg,ts:now()}]}:g));setSelGroup({...selGroup,msgs:[...(selGroup.msgs||[]),{from:user.id,body:grpMsg,ts:now()}]});setGrpMsg("");}}}/>
          <Btn v="primary" ico="send" sz="sm" onClick={()=>{if(!grpMsg.trim())return;setGroups(groups.map(g=>g.id===selGroup.id?{...g,msgs:[...(g.msgs||[]),{from:user.id,body:grpMsg,ts:now()}]}:g));setSelGroup({...selGroup,msgs:[...(selGroup.msgs||[]),{from:user.id,body:grpMsg,ts:now()}]});setGrpMsg("");}}>Send</Btn>
        </div>
      </Crd>
    </div>}

    {tab==="dir"&&<Tbl cols={[
      {h:"User",r:r=><div style={{display:"flex",alignItems:"center",gap:10}}><Avt name={r.name} sz={28} c={C.blue}/><span style={{fontWeight:600}}>{r.name}</span></div>},
      {h:"Role",r:r=><Bdg c={r.role==="Administrator"?C.red:r.role==="Director"?C.blue:C.mid}>{r.role}</Bdg>},
      {h:"Email",k:"email"},
      {h:"Locations",r:r=>r.locations.map(id=>initLocations().find(l=>l.id===id)?.name).join(", ")},
      {h:"",r:()=><Btn v="ghost" sz="sm" ico="send">Message</Btn>},
    ]} data={users}/>}

    {newModal&&(()=>{const _C=()=>{
      const [to,sTo]=useState([]);const[subj,sSubj]=useState("");const[body,sBody]=useState("");
      const send=()=>{if(!subj||!body||to.length===0)return;setMsgs([{id:msgs.length+1,from:user.id,to:to.map(Number),subj,body,ts:now(),read:{}},...msgs]);setNewModal(false);};
      return <Modal title="New Message" onClose={()=>setNewModal(false)}>
        <Field label="To"><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{users.filter(u=>u.id!==user.id).map(u=><label key={u.id} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,padding:"4px 8px",borderRadius:6,backgroundColor:to.includes(u.id)?`${C.blue}18`:C.lt,cursor:"pointer",border:`1px solid ${to.includes(u.id)?C.blue:"#E5E7EB"}`}}><input type="checkbox" checked={to.includes(u.id)} onChange={e=>sTo(e.target.checked?[...to,u.id]:to.filter(x=>x!==u.id))} style={{display:"none"}}/>{u.name}</label>)}</div></Field>
        <Field label="Subject"><Inp val={subj} set={sSubj} ph="Message subject"/></Field>
        <Field label="Message"><Txta val={body} set={sBody} ph="Type your message..." rows={5}/></Field>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setNewModal(false)}>Cancel</Btn><Btn v="primary" ico="send" onClick={send}>Send Message</Btn></div>
      </Modal>;
      };return <_C/>;})()}
  </div>;
};

/* ============================================================
   CUSTOMER SERVICE MODULE
   ============================================================ */
const CS = () => {
  const {user,users,tickets,setTickets,customers} = useApp();
  const [tab,setTab] = useState("all");
  const [sel,setSel] = useState(null);
  const [reply,setReply] = useState("");
  const [newModal,setNewModal] = useState(false);
  const [csCatF,setCsCatF] = useState("all");
  const open = tickets.filter(t=>!["Resolved","Closed"].includes(t.status));
  const tabs=[{id:"all",l:"All Tickets",n:tickets.length},{id:"open",l:"Open",n:open.length},{id:"cats",l:"Categories"}];

  const addReply = (type) => {
    if(!reply.trim()||!sel) return;
    const nt = {...sel,thread:[...sel.thread,{from:user.name,msg:reply,t:now(),type}]};
    setTickets(tickets.map(t=>t.id===sel.id?nt:t)); setSel(nt); setReply("");
  };

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Customer Service</h2>
      <Btn v="primary" ico="plus" onClick={()=>setNewModal(true)}>Create Ticket</Btn>
    </div>
    <TabB tabs={tabs} act={tab} set={setTab}/>

    {(tab==="all"||tab==="open")&&!sel&&<div>
      {/* Category Header Tabs */}
      <TabB tabs={[{id:"all",l:"All"},...TKTCATS.map(c=>({id:c.name,l:c.name}))]} act={csCatF} set={setCsCatF}/>
      <Tbl cols={[
      {h:"Ticket",r:r=><span style={{fontWeight:700,fontFamily:"monospace"}}>{r.id}</span>},
      {h:"Category",r:r=><Bdg c={C.blue}>{r.cat}</Bdg>},
      {h:"Customer",r:r=>{const c=customers.find(x=>x.id===r.cid);return c?custName(c):"";}},
      {h:"Status",r:r=><SBdg status={r.status} map={TSTATUS}/>},
      {h:"Priority",r:r=><Bdg c={r.pri==="High"?C.red:r.pri==="Medium"?C.org:C.grn}>{r.pri}</Bdg>},
      {h:"SLA",r:r=>{const dl=new Date(r.sla?.replace(/(\d{2})\/(\d{2})\s/,"2026-$1-$2T")+"Z");const hrs=Math.round((dl-new Date("2026-03-30T12:00:00Z"))/36e5);return <span style={{fontSize:12,fontWeight:600,color:hrs<0?C.red:hrs<12?C.org:C.grn}}>{hrs<0?`${Math.abs(hrs)}h overdue`:`${hrs}h left`}</span>;}},
      {h:"Created",r:r=><span style={{fontSize:12,color:C.mid}}>{r.at}</span>},
    ]} data={(tab==="open"?open:tickets).filter(t=>csCatF==="all"||t.cat===csCatF)} onRow={r=>setSel(r)}/>
    </div>}

    {sel&&<div>
      <button onClick={()=>setSel(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.mid,marginBottom:16,fontFamily:"inherit"}}><Ico d={ICONS.back} sz={16}/> Back</button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
        <div>
          <Crd sty={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div><h3 style={{fontSize:17,fontWeight:700,color:C.blk,margin:"0 0 4px"}}>{sel.id}</h3><Bdg c={C.blue}>{sel.cat}</Bdg></div>
              <SBdg status={sel.status} map={TSTATUS}/>
            </div>
            <p style={{fontSize:14,color:C.blk,lineHeight:1.6,margin:0}}>{sel.desc}</p>
          </Crd>
          <Crd>
            <h4 style={{fontSize:14,fontWeight:700,margin:"0 0 16px",color:C.blk}}>Thread</h4>
            {sel.thread.map((e,i)=><div key={i} style={{padding:"12px 16px",marginBottom:8,borderRadius:8,backgroundColor:e.type==="auto"?"#FFF9C4":e.type==="email"?"#E8F5E9":C.lt,borderLeft:`3px solid ${e.type==="email"?C.grn:e.type==="auto"?C.yel:C.blue}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:600,color:C.blk}}>{e.from}</span><div style={{display:"flex",alignItems:"center",gap:6}}>{e.type==="email"&&<Bdg c={C.grn} sm>Email</Bdg>}{e.type==="auto"&&<Bdg c={C.org} sm>Auto</Bdg>}<span style={{fontSize:11,color:C.mid}}>{e.t}</span></div></div>
              <div style={{fontSize:13,color:C.blk,lineHeight:1.5}}>{e.msg}</div>
            </div>)}
            <div style={{marginTop:16,borderTop:"1px solid #E5E7EB",paddingTop:16}}>
              <Txta val={reply} set={setReply} ph="Type your reply..." rows={3}/>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <Btn v="primary" sz="sm" ico="send" onClick={()=>addReply("int")}>Internal Reply</Btn>
                <Btn v="blue" sz="sm" ico="mail" onClick={()=>addReply("email")}>Email Customer</Btn>
                <Btn v="ghost" sz="sm" ico="att">Attach</Btn>
              </div>
            </div>
          </Crd>
        </div>
        <div>
          <Crd sty={{marginBottom:12}}>
            <h4 style={{fontSize:13,fontWeight:700,margin:"0 0 12px",color:C.mid,textTransform:"uppercase"}}>Customer</h4>
            {(()=>{const c=customers.find(x=>x.id===sel.cid);return c?<div><div style={{fontSize:14,fontWeight:600,color:C.blk}}>{custName(c)}</div><div style={{fontSize:12,color:C.mid,marginTop:4}}>{c.phone}</div><div style={{fontSize:12,color:C.mid}}>{c.email}</div></div>:null;})()}
          </Crd>
          <Crd sty={{marginBottom:12}}>
            <h4 style={{fontSize:13,fontWeight:700,margin:"0 0 12px",color:C.mid,textTransform:"uppercase"}}>Details</h4>
            <div style={{fontSize:12,color:C.mid,marginBottom:4}}>Assigned To</div>
            <div style={{marginBottom:12}}>{sel.assign.map(id=><Bdg key={id} c={C.blue}>{users.find(u=>u.id===id)?.name}</Bdg>)}</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:4}}>SLA Deadline</div>
            <div style={{fontSize:13,fontWeight:600,color:C.blk,marginBottom:12}}>{sel.sla}</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:4}}>Created By</div>
            <div style={{fontSize:13,fontWeight:600,color:C.blk}}>{users.find(u=>u.id===sel.by)?.name}</div>
          </Crd>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {!["Attendant","Lead"].includes(user.role)&&<Btn v="blue" full onClick={()=>{const next=sel.status==="Open"?"In Progress":sel.status==="In Progress"?"Awaiting Customer":"In Progress";const nt={...sel,status:next};setTickets(tickets.map(t=>t.id===sel.id?nt:t));setSel(nt);}}>Advance Status</Btn>}
            {!["Attendant","Lead"].includes(user.role)&&<Btn v="green" ico="tick" full onClick={()=>{const nt={...sel,status:"Resolved"};setTickets(tickets.map(t=>t.id===sel.id?nt:t));setSel(nt);}}>Resolve Ticket</Btn>}
            {["Attendant","Lead"].includes(user.role)&&<div style={{padding:12,backgroundColor:C.lt,borderRadius:8,fontSize:12,color:C.mid,textAlign:"center"}}>View only — contact a Specialist or above to resolve this ticket</div>}
          </div>
        </div>
      </div>
    </div>}

    {tab==="cats"&&<Tbl cols={[
      {h:"Category",r:r=><span style={{fontWeight:600}}>{r.name}</span>},
      {h:"SLA",r:r=>`${r.sla} hours`},
      {h:"Assigned Roles",r:r=><div style={{display:"flex",gap:4}}>{r.roles.map(rl=><Bdg key={rl} c={C.blue} sm>{rl}</Bdg>)}</div>},
    ]} data={TKTCATS}/>}

    {newModal&&(()=>{const _C=()=>{
      const [cid,sCid]=useState("");const[cat,sCat]=useState("");const[pri,sPri]=useState("Medium");const[desc,sDesc]=useState("");
      const save=()=>{if(!cid||!cat||!desc)return;const id=`TKT-${nid()}`;const catObj=TKTCATS.find(c=>c.name===cat);setTickets([{id,cid:+cid,cat,status:"Open",pri,assign:users.filter(u=>catObj?.roles.includes(u.role)).map(u=>u.id).slice(0,1),loc:1,by:user.id,at:now(),sla:"04/03 12:00",desc,thread:[{from:user.name,msg:desc,t:now(),type:"int"},{from:"System",msg:`Email sent to customer: Ticket ${id} received.`,t:now(),type:"auto"}]},...tickets]);setNewModal(false);};
      return <Modal title="Create Ticket" onClose={()=>setNewModal(false)}>
        <Field label="Customer"><Sel val={cid} set={sCid} opts={customers.map(c=>({v:c.id,l:custName(c)}))} ph="Select customer"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Category"><Sel val={cat} set={sCat} opts={TKTCATS.map(c=>({v:c.name,l:c.name}))} ph="Select category"/></Field>
          <Field label="Priority"><Sel val={pri} set={sPri} opts={["Low","Medium","High"].map(p=>({v:p,l:p}))}/></Field>
        </div>
        <Field label="Description"><Txta val={desc} set={sDesc} ph="Describe the issue..." rows={4}/></Field>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setNewModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Create Ticket</Btn></div>
      </Modal>;
      };return <_C/>;})()}
  </div>;
};

/* ============================================================
   TIME & ATTENDANCE
   ============================================================ */
const TA = () => {
  const {selectedLoc:loc,users,user,scheds,setScheds} = useApp();
  const [tab,setTab] = useState("sched");
  const [addModal,setAddModal] = useState(false);
  const [clockedIn,setClockedIn] = useState(true);
  const tabs=[{id:"sched",l:"Schedule"},{id:"clock",l:"Clock In/Out"},{id:"to",l:"Time Off"},{id:"ts",l:"Timesheets"},{id:"shifts",l:"Shift Templates"}];
  const days=["Mon 3/30","Tue 3/31","Wed 4/1","Thu 4/2","Fri 4/3","Sat 4/4","Sun 4/5"];
  const locUsers = users.filter(u=>u.locations.includes(loc));

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Time & Attendance</h2>
      <div style={{display:"flex",gap:8}}><Btn v="secondary" ico="dl">Export CSV</Btn><Btn v="primary" ico="plus" onClick={()=>setAddModal(true)}>Add Shift</Btn></div>
    </div>
    <TabB tabs={tabs} act={tab} set={setTab}/>

    {tab==="sched"&&<Crd><div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr><th style={{padding:12,textAlign:"left",fontWeight:600,color:C.mid,fontSize:11,textTransform:"uppercase",borderBottom:"2px solid #E5E7EB",minWidth:160}}>Employee</th>
          {days.map(d=><th key={d} style={{padding:12,textAlign:"center",fontWeight:600,color:d==="Mon 3/30"?C.red:C.mid,fontSize:11,textTransform:"uppercase",borderBottom:"2px solid #E5E7EB",minWidth:120,backgroundColor:d==="Mon 3/30"?"#FFF5F5":"transparent"}}>{d}</th>)}</tr></thead>
        <tbody>{locUsers.map(u=>{const s=scheds.find(x=>x.uid===u.id&&x.date==="2026-03-30"&&x.loc===loc);
          return <tr key={u.id}><td style={{padding:"10px 12px",borderBottom:"1px solid #F3F4F6"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avt name={u.name} sz={28} c={C.blue}/><div><div style={{fontWeight:600,fontSize:13}}>{u.name}</div><div style={{fontSize:11,color:C.mid}}>{u.role}</div></div></div></td>
            <td style={{padding:8,textAlign:"center",borderBottom:"1px solid #F3F4F6",backgroundColor:"#FFF5F5"}}>{s?<div style={{backgroundColor:`${C.blue}14`,padding:"6px 8px",borderRadius:6,borderLeft:`3px solid ${C.blue}`}}><div style={{fontSize:12,fontWeight:600,color:C.blue}}>{s.shift}</div><div style={{fontSize:11,color:C.mid}}>{s.s} — {s.e}</div>{s.ci&&<div style={{fontSize:10,color:C.grn,marginTop:2}}>In: {s.ci}</div>}{!s.ci&&<div style={{fontSize:10,color:C.red,marginTop:2}}>No clock-in</div>}</div>:<span style={{fontSize:12,color:"#D1D5DB"}}>—</span>}</td>
            {days.slice(1).map(d=><td key={d} style={{padding:8,textAlign:"center",borderBottom:"1px solid #F3F4F6"}}><span style={{fontSize:12,color:"#D1D5DB"}}>—</span></td>)}
          </tr>;})}
        </tbody></table>
    </div></Crd>}

    {tab==="ts"&&<Tbl cols={[
      {h:"Employee",r:r=><div style={{display:"flex",alignItems:"center",gap:8}}><Avt name={r.name} sz={28} c={C.blue}/><span style={{fontWeight:600}}>{r.name}</span></div>},
      {h:"Role",r:r=><Bdg c={C.mid}>{r.role}</Bdg>},
      {h:"Hours",r:()=><span style={{fontWeight:600}}>32.5</span>},
      {h:"Overtime",r:()=><span style={{color:C.mid}}>0h</span>},
      {h:"Status",r:()=><Bdg c={C.org}>Pending</Bdg>},
      {h:"",r:()=><Btn v="ghost" sz="sm" ico="tick">Approve</Btn>},
    ]} data={locUsers}/>}

    {tab==="to"&&<div>
      <div style={{display:"flex",gap:12,marginBottom:20}}>
        <Btn v="blue" ico="clk">Request Vacation</Btn>
        <Btn v="blue" ico="clk">Request PTO</Btn>
        <Btn v="secondary" ico="flag">Swap Shift</Btn>
      </div>
      <div style={{textAlign:"center",padding:40,color:C.mid}}><Ico d={ICONS.clk} sz={48} c={C.mid}/><div style={{fontSize:16,fontWeight:600,marginTop:12}}>No Pending Requests</div><div style={{fontSize:13,marginTop:6}}>Time off requests will appear here.</div></div>
    </div>}

    {tab==="shifts"&&<div>
      <Tbl cols={[
        {h:"Shift",r:r=><span style={{fontWeight:600}}>{r.name}</span>},
        {h:"Start",k:"s"},{h:"End",k:"e"},
        {h:"Duration",r:r=>`${(parseInt(r.e)||24)-parseInt(r.s)} hours`},
        {h:"",r:()=><div style={{display:"flex",gap:4}}><Btn v="ghost" sz="sm" ico="edit">Edit</Btn></div>},
      ]} data={SHIFTS}/>
    </div>}

    {tab==="clock"&&<Crd sty={{maxWidth:400,margin:"0 auto",textAlign:"center",padding:40}}>
      <div style={{width:80,height:80,borderRadius:"50%",backgroundColor:clockedIn?`${C.grn}14`:`${C.red}14`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><Ico d={ICONS.clk} sz={40} c={clockedIn?C.grn:C.red}/></div>
      <div style={{fontSize:32,fontWeight:700,color:C.blk,marginBottom:8}}>{new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
      <div style={{fontSize:14,color:C.mid,marginBottom:24}}>Monday, March 30, 2026</div>
      {clockedIn&&<div style={{fontSize:13,color:C.grn,fontWeight:600,marginBottom:24}}>Clocked in at 05:58 AM</div>}
      <Btn v={clockedIn?"primary":"green"} sz="lg" full onClick={()=>setClockedIn(!clockedIn)}>{clockedIn?"Clock Out":"Clock In"}</Btn>
    </Crd>}

    {addModal&&(()=>{const _C=()=>{
      const [uid,sUid]=useState("");const[sh,sSh]=useState("");const[dt,sDt]=useState("2026-03-31");
      const save=()=>{if(!uid||!sh)return;const tmpl=SHIFTS.find(s=>s.name===sh);if(!tmpl)return;setScheds([...scheds,{id:scheds.length+1,uid:+uid,loc,date:dt,shift:sh,s:tmpl.s,e:tmpl.e,ci:null,co:null}]);setAddModal(false);};
      return <Modal title="Add Shift" onClose={()=>setAddModal(false)}>
        <Field label="Employee"><Sel val={uid} set={sUid} opts={locUsers.map(u=>({v:u.id,l:u.name}))} ph="Select employee"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Shift Template"><Sel val={sh} set={sSh} opts={SHIFTS.map(s=>({v:s.name,l:s.name}))} ph="Select shift"/></Field>
          <Field label="Date"><Inp val={dt} set={sDt} type="date"/></Field>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setAddModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Add Shift</Btn></div>
      </Modal>;
      };return <_C/>;})()}
  </div>;
};

/* ============================================================
   KNOWLEDGE BASE
   ============================================================ */
const KB = () => {
  const {user,kb,setKB,users:allUsers} = useApp();
  const [srch,setSrch] = useState("");
  const [catF,setCatF] = useState("");
  const [sel,setSel] = useState(null);
  const [newModal,setNewModal] = useState(false);
  const canEdit = user.role==="Administrator";
  const filtered = kb.filter(a=>{
    if(catF&&a.cat!==catF)return false;
    if(srch&&!a.title.toLowerCase().includes(srch.toLowerCase())&&!a.body.toLowerCase().includes(srch.toLowerCase()))return false;
    if(!a.vis.includes("All")&&!a.vis.includes(user.role))return false;
    return true;
  });
  const isRecent = (a) => {const d=a.updated||a.created;if(!d)return false;/* simplified — articles updated in last 7 days */return d.startsWith("03/");};

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Knowledge Base</h2>
      {canEdit&&<Btn v="primary" ico="plus" onClick={()=>setNewModal(true)}>New Article</Btn>}
    </div>
    {!sel?<div>
      <div style={{marginBottom:16}}><SrchBar val={srch} set={setSrch} ph="Search articles..."/></div>
      {/* Category Header Tabs */}
      <TabB tabs={[{id:"",l:"All"},...KBCATS.map(c=>({id:c,l:c}))]} act={catF} set={setCatF}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
        {filtered.map(a=><Crd key={a.id} onClick={()=>setSel(a)} sty={{cursor:"pointer",borderLeft:isRecent(a)?`4px solid ${C.grn}`:"4px solid transparent"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",gap:6}}><Bdg c={C.blue}>{a.cat}</Bdg>{isRecent(a)&&<Bdg c={C.grn} bg={C.grnLt}>New/Updated</Bdg>}</div>
            <span style={{fontSize:11,color:C.mid}}>v{a.ver}</span>
          </div>
          <h3 style={{fontSize:15,fontWeight:700,color:C.blk,margin:"0 0 8px"}}>{a.title}</h3>
          <p style={{fontSize:13,color:C.mid,lineHeight:1.5,margin:"0 0 12px",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{a.body}</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:11,color:C.mid}}>Updated: {a.updated}</span>{a.files.length>0&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:C.mid}}><Ico d={ICONS.att} sz={12}/> {a.files.length}</div>}</div>
        </Crd>)}
      </div>
    </div>
    :<div>
      <button onClick={()=>setSel(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.mid,marginBottom:16,fontFamily:"inherit"}}><Ico d={ICONS.back} sz={16}/> Back</button>
      <Crd>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
          <div><Bdg c={C.blue}>{sel.cat}</Bdg><h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:"8px 0 0"}}>{sel.title}</h2><div style={{fontSize:12,color:C.mid,marginTop:6}}>By {allUsers.find(u=>u.id===sel.by)?.name} • v{sel.ver} • Updated {sel.updated}</div><div style={{fontSize:12,color:C.mid,marginTop:4}}>Visible to: {sel.vis.join(", ")}</div></div>
          {canEdit&&<div style={{display:"flex",gap:8}}><Btn v="secondary" sz="sm" ico="edit">Edit</Btn><Btn v="ghost" sz="sm" ico="trash">Delete</Btn></div>}
        </div>
        <div style={{fontSize:14,lineHeight:1.8,color:C.blk,borderTop:"1px solid #E5E7EB",paddingTop:20,whiteSpace:"pre-wrap"}}>{sel.body}</div>
        {sel.files.length>0&&<div style={{marginTop:24,borderTop:"1px solid #E5E7EB",paddingTop:16}}>
          <h4 style={{fontSize:13,fontWeight:700,color:C.mid,marginBottom:8,textTransform:"uppercase"}}>Attachments</h4>
          {sel.files.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",backgroundColor:C.lt,borderRadius:6,marginBottom:6}}><Ico d={ICONS.att} sz={14} c={C.mid}/><span style={{fontSize:13,color:C.blue,fontWeight:500}}>{f}</span><Btn v="ghost" sz="sm" ico="dl" sty={{marginLeft:"auto"}}>Download</Btn></div>)}
        </div>}
      </Crd>
    </div>}

    {newModal&&(()=>{const _C=()=>{
      const [title,sTitle]=useState("");const[cat,sCat]=useState("");const[body,sBody]=useState("");const[vis,sVis]=useState("All");
      const save=()=>{if(!title||!cat||!body)return;setKB([{id:kb.length+1,title,cat,body,vis:[vis],by:user.id,created:now(),updated:now(),ver:1,files:[]},...kb]);setNewModal(false);};
      return <Modal title="New Article" onClose={()=>setNewModal(false)} w="700px">
        <Field label="Title"><Inp val={title} set={sTitle} ph="Article title"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Category"><Sel val={cat} set={sCat} opts={KBCATS.map(c=>({v:c,l:c}))} ph="Select category"/></Field>
          <Field label="Visible To"><Sel val={vis} set={sVis} opts={[{v:"All",l:"All Users"},...ROLES.map(r=>({v:r,l:r+" and above"}))]}/></Field>
        </div>
        <Field label="Content"><Txta val={body} set={sBody} ph="Write article content..." rows={12}/></Field>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setNewModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Publish Article</Btn></div>
      </Modal>;
      };return <_C/>;})()}
  </div>;
};

/* ============================================================
   INVENTORY MODULE
   ============================================================ */
const initInventory = () => ({
  warehouses:[{id:1,name:"Central Warehouse",address:"123 Industrial Dr"},{id:2,name:"West Storage",address:"456 Commerce Blvd"}],
  items:[
    {id:1,name:"Detergent Pod Pack",pid:1,wh:1,qty:500,unit:"packs"},
    {id:2,name:"Fabric Softener",pid:2,wh:1,qty:200,unit:"bottles"},
    {id:3,name:"Dryer Sheets",pid:3,wh:1,qty:400,unit:"boxes"},
    {id:4,name:"Trash Bags (50ct)",pid:null,wh:1,qty:80,unit:"cases"},
    {id:5,name:"Cleaning Solution",pid:null,wh:1,qty:45,unit:"gallons"},
    {id:6,name:"Paper Towels",pid:null,wh:2,qty:120,unit:"rolls"},
    {id:7,name:"Hangers",pid:null,wh:2,qty:1000,unit:"pieces"},
  ],
  log:[
    {id:1,itemId:1,type:"transfer",qty:-50,from:"Central Warehouse",to:"Downtown",by:"Sarah Mitchell",at:"03/28 09:00",note:"Weekly restock"},
    {id:2,itemId:2,type:"transfer",qty:-24,from:"Central Warehouse",to:"Westside",by:"James Porter",at:"03/27 14:00",note:"Low stock request"},
    {id:3,itemId:1,type:"received",qty:200,from:"Vendor: CleanSupply Co",to:"Central Warehouse",by:"Sarah Mitchell",at:"03/25 11:00",note:"PO #4521"},
    {id:4,itemId:4,type:"transfer",qty:-10,from:"Central Warehouse",to:"Eastgate",by:"Sarah Mitchell",at:"03/29 08:00",note:"Monthly supply"},
    {id:5,itemId:1,type:"pos_sale",qty:-3,from:"Downtown",to:"Customer",by:"System",at:"03/30 10:15",note:"Auto: POS sale ORD-001"},
  ],
});

const Inventory = () => {
  const {user,locations} = useApp();
  const [invData,setInvData] = useState(initInventory);
  const [tab,setTab] = useState("stock");
  const [newModal,setNewModal] = useState(false);
  const [transferModal,setTransferModal] = useState(false);
  const [addStockModal,setAddStockModal] = useState(false);
  const tabs=[{id:"stock",l:"Current Stock"},{id:"log",l:"Activity Log",n:invData.log.length},{id:"warehouses",l:"Warehouses"}];
  const INV_CATS=["Vending Supplies","Retail Supplies","WDF Supplies"];
  const [invCatF,setInvCatF] = useState(INV_CATS[0]);

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Inventory</h2>
      <div style={{display:"flex",gap:8}}>
        <Btn v="secondary" ico="truck" onClick={()=>setTransferModal(true)}>Transfer</Btn>
        <Btn v="blue" ico="plus" onClick={()=>setAddStockModal(true)}>Receive Stock</Btn>
        <Btn v="primary" ico="plus" onClick={()=>setNewModal(true)}>Add Item</Btn>
      </div>
    </div>
    <TabB tabs={tabs} act={tab} set={setTab}/>

    {tab==="stock"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:20}}>
        <Stat label="Total Items" value={invData.items.length} ico="box" c={C.blue}/>
        <Stat label="Low Stock Items" value={invData.items.filter(i=>i.qty<50).length} ico="alert" c={C.org}/>
        <Stat label="Warehouses" value={invData.warehouses.length} ico="bldg" c={C.purp}/>
        <Stat label="Transfers This Week" value={invData.log.filter(l=>l.type==="transfer").length} ico="truck" c={C.grn}/>
      </div>
      {/* Category Header Tabs */}
      <TabB tabs={INV_CATS.map(c=>({id:c,l:c}))} act={invCatF} set={setInvCatF}/>
      <Tbl cols={[
        {h:"Item",r:r=><div><span style={{fontWeight:600}}>{r.name}</span>{r.pid&&<Bdg c={C.blue} sm style={{marginLeft:6}}>POS Linked</Bdg>}</div>},
        {h:"Warehouse",r:r=>invData.warehouses.find(w=>w.id===r.wh)?.name},
        {h:"Quantity",r:r=><span style={{fontWeight:700,color:r.qty<50?C.red:r.qty<100?C.org:C.grn}}>{r.qty}</span>},
        {h:"Unit",k:"unit"},
        {h:"Status",r:r=><Bdg c={r.qty<50?C.red:r.qty<100?C.org:C.grn} bg={r.qty<50?"#FFCDD2":r.qty<100?"#FFE0B2":"#C8E6C9"}>{r.qty<50?"Low":r.qty<100?"Medium":"Good"}</Bdg>},
      ]} data={[...invData.items].sort((a,b)=>(a.qty<50?0:a.qty<100?1:2)-(b.qty<50?0:b.qty<100?1:2))}/>
    </div>}

    {tab==="log"&&<Tbl cols={[
      {h:"Date",r:r=><span style={{fontSize:12,color:C.mid}}>{r.at}</span>},
      {h:"Item",r:r=><span style={{fontWeight:600}}>{invData.items.find(i=>i.id===r.itemId)?.name||"Unknown"}</span>},
      {h:"Type",r:r=><Bdg c={r.type==="transfer"?C.blue:r.type==="received"?C.grn:r.type==="pos_sale"?C.org:C.mid} sm>{r.type==="pos_sale"?"POS Sale":r.type.charAt(0).toUpperCase()+r.type.slice(1)}</Bdg>},
      {h:"Qty",r:r=><span style={{fontWeight:700,color:r.qty>0?C.grn:C.red}}>{r.qty>0?"+":""}{r.qty}</span>},
      {h:"From",k:"from"},{h:"To",k:"to"},
      {h:"By",k:"by"},
      {h:"Note",r:r=><span style={{fontSize:12,color:C.mid}}>{r.note}</span>},
    ]} data={invData.log}/>}

    {tab==="warehouses"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
      {invData.warehouses.map(wh=>{const items=invData.items.filter(i=>i.wh===wh.id);return <Crd key={wh.id}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><div style={{width:40,height:40,borderRadius:10,backgroundColor:`${C.purp}14`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico d={ICONS.bldg} sz={20} c={C.purp}/></div><div><div style={{fontSize:15,fontWeight:700,color:C.blk}}>{wh.name}</div><div style={{fontSize:12,color:C.mid}}>{wh.address}</div></div></div>
        <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>{items.length} items in stock</div>
        {items.map(it=><div key={it.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #F3F4F6",fontSize:13}}><span>{it.name}</span><span style={{fontWeight:600,color:it.qty<50?C.red:C.blk}}>{it.qty} {it.unit}</span></div>)}
      </Crd>;})}
    </div>}

    {transferModal&&(()=>{const _C=()=>{
      const [itemId,sItemId]=useState("");const[qty,sQty]=useState("");const[from,sFrom]=useState("");const[toLoc,sToLoc]=useState("");const[note,sNote]=useState("");
      const allDests=[...invData.warehouses.map(w=>({v:`wh-${w.id}`,l:w.name})),...locations.map(l=>({v:`loc-${l.id}`,l:l.name}))];
      const save=()=>{if(!itemId||!qty||!from||!toLoc)return;const item=invData.items.find(i=>i.id===+itemId);const fromName=allDests.find(d=>d.v===from)?.l;const toName=allDests.find(d=>d.v===toLoc)?.l;
        setInvData({...invData,items:invData.items.map(i=>i.id===+itemId?{...i,qty:i.qty-+qty}:i),log:[{id:invData.log.length+1,itemId:+itemId,type:"transfer",qty:-parseInt(qty),from:fromName,to:toName,by:user.name,at:now(),note},...invData.log]});setTransferModal(false);};
      return <Modal title="Transfer Inventory" onClose={()=>setTransferModal(false)}>
        <Field label="Item"><Sel val={itemId} set={sItemId} opts={invData.items.map(i=>({v:i.id,l:`${i.name} (${i.qty} ${i.unit})`}))} ph="Select item"/></Field>
        <Field label="Quantity"><Inp val={qty} set={sQty} ph="Enter quantity" type="number"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="From"><Sel val={from} set={sFrom} opts={allDests} ph="Select source"/></Field>
          <Field label="To"><Sel val={toLoc} set={sToLoc} opts={allDests} ph="Select destination"/></Field>
        </div>
        <Field label="Note"><Inp val={note} set={sNote} ph="Transfer note (optional)"/></Field>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setTransferModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Transfer</Btn></div>
      </Modal>;
      };return <_C/>;})()}

    {addStockModal&&(()=>{const _C=()=>{
      const [itemId,sItemId]=useState("");const[qty,sQty]=useState("");const[vendor,sVendor]=useState("");const[note,sNote]=useState("");
      const save=()=>{if(!itemId||!qty)return;const item=invData.items.find(i=>i.id===+itemId);const whName=invData.warehouses.find(w=>w.id===item.wh)?.name;
        setInvData({...invData,items:invData.items.map(i=>i.id===+itemId?{...i,qty:i.qty+parseInt(qty)}:i),log:[{id:invData.log.length+1,itemId:+itemId,type:"received",qty:+qty,from:vendor||"Vendor",to:whName,by:user.name,at:now(),note},...invData.log]});setAddStockModal(false);};
      return <Modal title="Receive Stock" onClose={()=>setAddStockModal(false)}>
        <Field label="Item"><Sel val={itemId} set={sItemId} opts={invData.items.map(i=>({v:i.id,l:i.name}))} ph="Select item"/></Field>
        <Field label="Quantity Received"><Inp val={qty} set={sQty} ph="Enter quantity" type="number"/></Field>
        <Field label="Vendor/Source"><Inp val={vendor} set={sVendor} ph="Vendor name or PO number"/></Field>
        <Field label="Note"><Inp val={note} set={sNote} ph="Receiving note (optional)"/></Field>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setAddStockModal(false)}>Cancel</Btn><Btn v="green" onClick={save}>Receive Stock</Btn></div>
      </Modal>;
      };return <_C/>;})()}

    {newModal&&(()=>{const _C=()=>{
      const [nm,sNm]=useState("");const[wh,sWh]=useState("");const[qty,sQty]=useState("");const[unit,sUnit]=useState("pieces");const[linked,sLinked]=useState(false);
      const save=()=>{if(!nm||!wh||!qty)return;setInvData({...invData,items:[...invData.items,{id:invData.items.length+1,name:nm,pid:null,wh:+wh,qty:+qty,unit}]});setNewModal(false);};
      return <Modal title="Add Inventory Item" onClose={()=>setNewModal(false)}>
        <Field label="Item Name"><Inp val={nm} set={sNm} ph="Item name"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <Field label="Warehouse"><Sel val={wh} set={sWh} opts={invData.warehouses.map(w=>({v:w.id,l:w.name}))} ph="Select"/></Field>
          <Field label="Initial Quantity"><Inp val={qty} set={sQty} ph="0" type="number"/></Field>
          <Field label="Unit"><Sel val={unit} set={sUnit} opts={["pieces","packs","bottles","boxes","cases","gallons","rolls"].map(u=>({v:u,l:u}))}/></Field>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setNewModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Add Item</Btn></div>
      </Modal>;
      };return <_C/>;})()}
  </div>;
};

/* ============================================================
   PROJECTS MODULE (Property Maintenance)
   ============================================================ */
const PROJ_STATUS={"Upcoming":{bg:C.blueLt,tx:C.blueDk},"In Progress":{bg:C.orgLt,tx:"#E65100"},"On Hold":{bg:C.yelLt,tx:"#F57F17"},"Completed":{bg:C.grnLt,tx:"#2E7D32"}};

const initProjects = () => [
  {id:1,name:"Downtown HVAC Replacement",loc:1,status:"In Progress",deadline:"2026-05-15",estCost:25000,actCost:12500,desc:"Full HVAC system replacement for main floor and back room.",by:1,at:"02/15",
    tasks:[{id:1,text:"Get 3 HVAC bids",done:true,assignee:2,doneBy:"James Porter",doneAt:"02/20"},{id:2,text:"Select contractor",done:true,assignee:1,doneBy:"Sarah Mitchell",doneAt:"03/01"},{id:3,text:"Schedule installation",done:false,assignee:2},{id:4,text:"Final inspection",done:false,assignee:1}],
    docs:[{name:"HVAC_Bid_CoolAir.pdf",at:"02/18",by:"James Porter"},{name:"HVAC_Bid_ComfortPro.pdf",at:"02/19",by:"James Porter"},{name:"Selected_Contract.pdf",at:"03/01",by:"Sarah Mitchell"}]},
  {id:2,name:"Westside Parking Lot Reseal",loc:2,status:"Upcoming",deadline:"2026-06-30",estCost:8000,actCost:0,desc:"Resurface and reseal entire parking lot. Restripe all spaces.",by:1,at:"03/10",
    tasks:[{id:5,text:"Survey current damage",done:false,assignee:2},{id:6,text:"Get contractor bids",done:false,assignee:2},{id:7,text:"Schedule work during low traffic",done:false,assignee:1}],
    docs:[]},
  {id:3,name:"Eastgate Lighting Upgrade",loc:3,status:"Completed",deadline:"2026-03-01",estCost:5500,actCost:5200,desc:"Replace all fluorescent fixtures with LED panels. Interior and exterior.",by:1,at:"01/15",
    tasks:[{id:8,text:"Order LED fixtures",done:true,assignee:1,doneBy:"Sarah Mitchell",doneAt:"01/20"},{id:9,text:"Hire electrician",done:true,assignee:2,doneBy:"James Porter",doneAt:"01/22"},{id:10,text:"Installation",done:true,assignee:2,doneBy:"James Porter",doneAt:"02/15"},{id:11,text:"Final walkthrough",done:true,assignee:1,doneBy:"Sarah Mitchell",doneAt:"02/20"}],
    docs:[{name:"LED_Invoice.pdf",at:"02/15",by:"James Porter"},{name:"Completion_Photos.zip",at:"02/20",by:"Sarah Mitchell"}]},
];

const Projects = () => {
  const {user,users,locations} = useApp();
  const [projects,setProjects] = useState(initProjects);
  const [sel,setSel] = useState(null);
  const [newModal,setNewModal] = useState(false);
  const [newTaskModal,setNewTaskModal] = useState(false);
  const [projTab,setProjTab] = useState("inprog");
  const isAdmin = user.role==="Administrator";
  const isML = user.locations.length>1;

  const ProjectCard = ({p}) => {const loc=locations.find(l=>l.id===p.loc);const doneTasks=p.tasks.filter(t=>t.done).length;const totalTasks=p.tasks.length;const pct=totalTasks?Math.round(doneTasks/totalTasks*100):0;
    return <Crd onClick={()=>setSel(p)} sty={{cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
        <div><div style={{fontSize:15,fontWeight:700,color:C.blk}}>{p.name}</div><div style={{fontSize:12,color:C.mid,marginTop:2}}>{loc?.name} • Due: {p.deadline}</div></div>
        <SBdg status={p.status} map={PROJ_STATUS}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.mid,marginBottom:8}}>
        <span>Budget: ${p.estCost.toLocaleString()}</span><span>Spent: ${p.actCost.toLocaleString()}</span>
      </div>
      <div style={{height:6,backgroundColor:C.lt,borderRadius:3,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:`${pct}%`,backgroundColor:pct===100?C.grn:C.blue,borderRadius:3}}/></div>
      <div style={{fontSize:12,color:C.mid}}>{doneTasks}/{totalTasks} tasks complete • {p.docs.length} documents</div>
    </Crd>;
  };

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Projects</h2>
      {isAdmin&&<Btn v="primary" ico="plus" onClick={()=>setNewModal(true)}>New Project</Btn>}
    </div>

    {!sel?<div>
      <TabB tabs={[{id:"upcoming",l:"Upcoming"},{id:"inprog",l:"In Progress"},{id:"completed",l:"Completed"},...(isML?[{id:"multi",l:"Multi-Site Overview"}]:[])]} act={projTab} set={setProjTab}/>

      {projTab==="upcoming"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
        {projects.filter(p=>p.status==="Upcoming").sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).map(p=><ProjectCard key={p.id} p={p}/>)}
        {projects.filter(p=>p.status==="Upcoming").length===0&&<div style={{textAlign:"center",padding:40,color:C.mid,gridColumn:"1/-1"}}><Ico d={ICONS.bldg} sz={40} c={C.mid}/><div style={{fontSize:15,fontWeight:600,marginTop:12}}>No upcoming projects</div></div>}
      </div>}

      {projTab==="inprog"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
        {projects.filter(p=>p.status==="In Progress").map(p=><ProjectCard key={p.id} p={p}/>)}
        {projects.filter(p=>p.status==="In Progress").length===0&&<div style={{textAlign:"center",padding:40,color:C.mid,gridColumn:"1/-1"}}><Ico d={ICONS.bldg} sz={40} c={C.mid}/><div style={{fontSize:15,fontWeight:600,marginTop:12}}>No in-progress projects</div></div>}
      </div>}

      {projTab==="completed"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
        {projects.filter(p=>p.status==="Completed").map(p=><ProjectCard key={p.id} p={p}/>)}
        {projects.filter(p=>p.status==="Completed").length===0&&<div style={{textAlign:"center",padding:40,color:C.mid,gridColumn:"1/-1"}}><Ico d={ICONS.bldg} sz={40} c={C.mid}/><div style={{fontSize:15,fontWeight:600,marginTop:12}}>No completed projects</div></div>}
      </div>}

      {projTab==="multi"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
        {locations.filter(l=>user.locations.includes(l.id)).map(l=>{const active=projects.filter(p=>p.loc===l.id&&(p.status==="Upcoming"||p.status==="In Progress"));
          return <Crd key={l.id}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><Ico d={ICONS.pin} sz={16} c={C.mid}/><span style={{fontSize:15,fontWeight:700,color:C.blk}}>{l.name}</span></div>
            <div style={{fontSize:28,fontWeight:700,color:active.length>0?C.blue:C.mid}}>{active.length}<span style={{fontSize:13,fontWeight:400,color:C.mid,marginLeft:6}}>active project{active.length!==1?"s":""}</span></div>
          </Crd>;
        })}
      </div>}
    </div>

    :<div>
      <button onClick={()=>setSel(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.mid,marginBottom:16,fontFamily:"inherit"}}><Ico d={ICONS.back} sz={16}/> Back to Projects</button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
        <div>
          <Crd sty={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
              <div><h3 style={{fontSize:20,fontWeight:700,color:C.blk,margin:0}}>{sel.name}</h3><div style={{fontSize:12,color:C.mid,marginTop:4}}>{locations.find(l=>l.id===sel.loc)?.name} • Created {sel.at}</div></div>
              <div style={{display:"flex",gap:8}}><SBdg status={sel.status} map={PROJ_STATUS}/>
                {isAdmin&&<Sel val={sel.status} set={v=>{const up={...sel,status:v};setProjects(projects.map(p=>p.id===sel.id?up:p));setSel(up);}} opts={Object.keys(PROJ_STATUS).map(s=>({v:s,l:s}))} sty={{minWidth:140}}/>}
              </div>
            </div>
            <p style={{fontSize:14,color:C.blk,lineHeight:1.6,margin:0}}>{sel.desc}</p>
          </Crd>

          <Crd sty={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h4 style={{fontSize:14,fontWeight:700,color:C.blk,margin:0}}>Task List</h4>
              {isAdmin&&<Btn v="secondary" sz="sm" ico="plus" onClick={()=>setNewTaskModal(true)}>Add Task</Btn>}
            </div>
            {sel.tasks.map(t=><div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}>
              <button onClick={()=>{if(t.done)return;const up={...sel,tasks:sel.tasks.map(x=>x.id===t.id?{...x,done:true,doneBy:user.name,doneAt:now()}:x)};setProjects(projects.map(p=>p.id===sel.id?up:p));setSel(up);}} style={{width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,border:t.done?"none":"2px solid #D1D5DB",backgroundColor:t.done?C.grn:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:t.done?"default":"pointer"}}>{t.done&&<Ico d={ICONS.tick} sz={14} c={C.wh}/>}</button>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.done?C.mid:C.blk,textDecoration:t.done?"line-through":"none"}}>{t.text}</div>
                <div style={{fontSize:11,color:C.mid,marginTop:2}}>Assigned: {users.find(u=>u.id===t.assignee)?.name||"Unassigned"}{t.done?` • Done by ${t.doneBy} at ${t.doneAt}`:""}</div>
              </div>
            </div>)}
          </Crd>

          <Crd>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h4 style={{fontSize:14,fontWeight:700,color:C.blk,margin:0}}>Documents</h4>
              <Btn v="secondary" sz="sm" ico="plus">Upload Document</Btn>
            </div>
            {sel.docs.length===0?<div style={{textAlign:"center",padding:20,color:C.mid,fontSize:13}}>No documents uploaded yet</div>
            :sel.docs.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",backgroundColor:C.lt,borderRadius:6,marginBottom:6}}>
              <Ico d={ICONS.file} sz={14} c={C.mid}/><span style={{fontSize:13,color:C.blue,fontWeight:500,flex:1}}>{d.name}</span>
              <span style={{fontSize:11,color:C.mid}}>{d.by} • {d.at}</span>
              <Btn v="ghost" sz="sm" ico="dl">Download</Btn>
            </div>)}
          </Crd>
        </div>

        <div>
          <Crd sty={{marginBottom:12}}>
            <h4 style={{fontSize:13,fontWeight:700,margin:"0 0 12px",color:C.mid,textTransform:"uppercase"}}>Budget</h4>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:C.mid}}>Estimated</span><span style={{fontSize:15,fontWeight:700,color:C.blk}}>${sel.estCost.toLocaleString()}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:12,color:C.mid}}>Actual Spent</span><span style={{fontSize:15,fontWeight:700,color:sel.actCost>sel.estCost?C.red:C.grn}}>${sel.actCost.toLocaleString()}</span></div>
            <div style={{height:8,backgroundColor:C.lt,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,sel.estCost?sel.actCost/sel.estCost*100:0)}%`,backgroundColor:sel.actCost>sel.estCost?C.red:C.grn,borderRadius:4}}/></div>
            <div style={{fontSize:11,color:C.mid,marginTop:6}}>{sel.estCost?Math.round(sel.actCost/sel.estCost*100):0}% of budget used</div>
          </Crd>
          <Crd sty={{marginBottom:12}}>
            <h4 style={{fontSize:13,fontWeight:700,margin:"0 0 12px",color:C.mid,textTransform:"uppercase"}}>Details</h4>
            <div style={{fontSize:12,color:C.mid,marginBottom:4}}>Deadline</div><div style={{fontSize:13,fontWeight:600,color:C.blk,marginBottom:12}}>{sel.deadline}</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:4}}>Created By</div><div style={{fontSize:13,fontWeight:600,color:C.blk,marginBottom:12}}>{users.find(u=>u.id===sel.by)?.name}</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:4}}>Location</div><div style={{fontSize:13,fontWeight:600,color:C.blk}}>{locations.find(l=>l.id===sel.loc)?.name}</div>
          </Crd>
        </div>
      </div>

      {newTaskModal&&(()=>{const _C=()=>{
        const [txt,sTxt]=useState("");const[asgn,sAsgn]=useState("");
        const save=()=>{if(!txt)return;const up={...sel,tasks:[...sel.tasks,{id:Date.now(),text:txt,done:false,assignee:+asgn||null}]};setProjects(projects.map(p=>p.id===sel.id?up:p));setSel(up);setNewTaskModal(false);};
        return <Modal title="Add Task" onClose={()=>setNewTaskModal(false)}>
          <Field label="Task Description"><Inp val={txt} set={sTxt} ph="Describe the task"/></Field>
          <Field label="Assign To"><Sel val={asgn} set={sAsgn} opts={users.map(u=>({v:u.id,l:u.name}))} ph="Select user (optional)"/></Field>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setNewTaskModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Add Task</Btn></div>
        </Modal>;
        };return <_C/>;})()}
    </div>}

    {newModal&&(()=>{const _C=()=>{
      const [nm,sNm]=useState("");const[loc,sLoc]=useState("");const[dl,sDl]=useState("");const[est,sEst]=useState("");const[desc,sDesc]=useState("");
      const save=()=>{if(!nm||!loc||!dl)return;setProjects([{id:projects.length+1,name:nm,loc:+loc,status:"Planning",deadline:dl,estCost:+est||0,actCost:0,desc,by:user.id,at:now(),tasks:[],docs:[]},...projects]);setNewModal(false);};
      return <Modal title="New Project" onClose={()=>setNewModal(false)}>
        <Field label="Project Name"><Inp val={nm} set={sNm} ph="e.g. Downtown Roof Repair"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Location"><Sel val={loc} set={sLoc} opts={locations.map(l=>({v:l.id,l:l.name}))} ph="Select location"/></Field>
          <Field label="Deadline"><Inp val={dl} set={sDl} type="date"/></Field>
        </div>
        <Field label="Estimated Budget"><Inp val={est} set={sEst} ph="25000" type="number"/></Field>
        <Field label="Description"><Txta val={desc} set={sDesc} ph="Describe the project scope..." rows={4}/></Field>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setNewModal(false)}>Cancel</Btn><Btn v="primary" onClick={save}>Create Project</Btn></div>
      </Modal>;
      };return <_C/>;})()}
  </div>;
};

/* ============================================================
   HR MODULE
   ============================================================ */
const HR_STAGES={"Training":{bg:C.blueLt,tx:C.blueDk},"PDP":{bg:C.orgLt,tx:"#E65100"},"Active":{bg:C.grnLt,tx:"#2E7D32"},"PIP":{bg:C.redLt,tx:C.redDk},"Terminated":{bg:"#ECEFF1",tx:"#546E7A"}};
const TRAIN_CATS=["Handbook and Bible","Email and Computer Skills","Sales","Ticketing","Cleaning (Equipment)","Cleaning (General)","WDF Process","Opening/Closing","Cash Management","Safety","De-Escalation/Customer Service"];
const REVIEW_CATS=["Attendance & Reliability","Work Execution & Productivity","Facility Standards","Customer Experience","Accountability & Ownership","Proactive Response"];

const initHR = () => [
  {id:5,uid:5,name:"Aisha Johnson",stage:"Active",hireDate:"2025-08-15",
    training:{week1:TRAIN_CATS.map(c=>({cat:c,status:"Completed",comment:""})),week2:TRAIN_CATS.map(c=>({cat:c,status:"Completed",comment:""})),trainer:"Tyler Reed",result:"Ready for Performance Development Period"},
    pdp:{start:"2025-08-29",end:"2025-10-28",review30:{date:"2025-09-28",scores:[5,4,4,5,4,5],total:27,tier:"Proactive",notes:"Strong performer. Self-motivated.",by:"Tyler Reed"},completed:true,raiseDate:"2025-10-28"},
    reviews:[{date:"2026-01-15",scores:[5,4,5,5,4,5],total:28,tier:"Proactive",notes:"Consistently exceeds expectations.",by:"Tyler Reed"},{date:"2026-03-15",scores:[4,4,4,5,5,5],total:27,tier:"Proactive",notes:"Great with customers. Reliable.",by:"Tyler Reed"}],
    interventions:[],pip:null,docs:["Offer_Letter.pdf","W4_Form.pdf"]},
  {id:6,uid:6,name:"Carlos Ruiz",stage:"PIP",hireDate:"2025-06-01",
    training:{week1:TRAIN_CATS.map(c=>({cat:c,status:"Completed",comment:""})),week2:TRAIN_CATS.map(c=>({cat:c,status:"Completed",comment:""})),trainer:"Devon Parker",result:"Ready for Performance Development Period"},
    pdp:{start:"2025-06-15",end:"2025-08-14",review30:{date:"2025-07-15",scores:[3,3,3,3,3,3],total:18,tier:"Reactive",notes:"Needs more initiative. Extended PDP.",by:"Devon Parker"},extended:true,completed:true},
    reviews:[{date:"2025-11-01",scores:[3,2,3,2,2,2],total:14,tier:"Reactive",notes:"Still relying on direction. Needs improvement.",by:"Devon Parker"},{date:"2026-02-01",scores:[2,1,2,1,1,1],total:8,tier:"Inactive",notes:"Failing to meet standards. PIP initiated.",by:"Devon Parker"}],
    interventions:[
      {id:1,type:"Written Warning",date:"2026-01-15",manager:"Devon Parker",loc:"Westside",problem:"Left store unattended for 20 minutes during shift.",expectations:"Must remain on floor at all times during shift.",actions:"Retrain on floor coverage policy.",handbook:"Section 4, Paragraph 2",probation:false,probEnd:null,consequence:"Further violations may result in PIP."},
      {id:2,type:"Final Warning",date:"2026-02-05",manager:"Devon Parker",loc:"Westside",problem:"Multiple customer complaints about unresponsiveness.",expectations:"Actively engage with every customer within 30 seconds of entry.",actions:"Shadow Lead for 1 week. Daily check-ins.",handbook:"Section 3, Paragraph 1",probation:true,probEnd:"2026-05-05",consequence:"Termination if no improvement."},
    ],
    pip:{start:"2026-02-05",end:"2026-05-05",review45:null,completed:false,strikes:2},
    docs:["Offer_Letter.pdf","Warning_01-15.pdf","Final_Warning_02-05.pdf"]},
  {id:4,uid:4,name:"Tyler Reed",stage:"Active",hireDate:"2025-03-01",
    training:{week1:TRAIN_CATS.map(c=>({cat:c,status:"Completed",comment:""})),week2:TRAIN_CATS.map(c=>({cat:c,status:"Completed",comment:""})),trainer:"James Porter",result:"Ready for Performance Development Period"},
    pdp:{start:"2025-03-15",end:"2025-05-14",review30:{date:"2025-04-14",scores:[5,5,4,4,5,5],total:28,tier:"Proactive",notes:"Leadership qualities evident.",by:"James Porter"},completed:true,raiseDate:"2025-05-14"},
    reviews:[{date:"2025-09-01",scores:[5,5,5,5,5,5],total:30,tier:"Proactive",notes:"Exemplary. Promoted to Lead.",by:"James Porter"},{date:"2026-03-01",scores:[5,5,5,5,5,4],total:29,tier:"Proactive",notes:"Outstanding leadership.",by:"James Porter"}],
    interventions:[],pip:null,docs:["Offer_Letter.pdf","Promotion_Letter.pdf"]},
];

const HR = () => {
  const {user,users} = useApp();
  const [hrData,setHrData] = useState(initHR);
  const [sel,setSel] = useState(null);
  const [tab,setTab] = useState("overview");
  const [reviewModal,setReviewModal] = useState(null);
  const [interventionModal,setInterventionModal] = useState(null);
  const [detailTab,setDetailTab] = useState("timeline");

  const tabs=[{id:"overview",l:"Overview"},{id:"reviews_due",l:"Upcoming Reviews"},{id:"training",l:"Training"},{id:"pip",l:"Active PIPs",n:hrData.filter(h=>h.stage==="PIP").length}];

  // Compute upcoming reviews within 30-day window
  const getNextReviewDate = (emp) => {
    if(emp.stage==="Training"||emp.stage==="Terminated") return null;
    const lastReview = emp.reviews.length>0 ? emp.reviews[emp.reviews.length-1].date : null;
    if(emp.pip) { const d=new Date("2026-"+emp.pip.start.replace(/\//g,"-")); d.setDate(d.getDate()+45); return d; }
    if(lastReview) { const parts=lastReview.split("-").length>1?lastReview:"2026-"+lastReview.replace(/\//g,"-"); const d=new Date(parts); const interval=emp.stage==="PDP"?30:180; d.setDate(d.getDate()+interval); return d; }
    return null;
  };
  const upcomingReviews = hrData.map(emp=>{
    const nd=getNextReviewDate(emp); if(!nd||isNaN(nd.getTime()))return null;
    const today=new Date("2026-03-31");
    const days=Math.ceil((nd-today)/(1000*60*60*24));
    if(days>30)return null;
    return {emp,nextDate:nd,daysUntil:days};
  }).filter(Boolean).sort((a,b)=>a.daysUntil-b.daysUntil);

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>HR</h2>
    </div>

    {!sel?<div>
      <TabB tabs={tabs} act={tab} set={setTab}/>
      {tab==="overview"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:20}}>
          <Stat label="Active Employees" value={hrData.filter(h=>h.stage==="Active").length} ico="usr" c={C.grn}/>
          <Stat label="In Training/PDP" value={hrData.filter(h=>["Training","PDP"].includes(h.stage)).length} ico="star" c={C.blue}/>
          <Stat label="On PIP" value={hrData.filter(h=>h.stage==="PIP").length} ico="alert" c={C.red}/>
          <Stat label="Total Records" value={hrData.length} ico="file" c={C.purp}/>
        </div>
        <Tbl cols={[
          {h:"Employee",r:r=><div style={{display:"flex",alignItems:"center",gap:10}}><Avt name={r.name} sz={28} c={HR_STAGES[r.stage]?.tx||C.blue}/><span style={{fontWeight:600}}>{r.name}</span></div>},
          {h:"Stage",r:r=><SBdg status={r.stage} map={HR_STAGES}/>},
          {h:"Hire Date",k:"hireDate"},
          {h:"Last Review",r:r=>{const lr=r.reviews[r.reviews.length-1];return lr?<div><span style={{fontSize:12}}>{lr.date}</span><Bdg c={lr.tier==="Proactive"?C.grn:lr.tier==="Reactive"?C.org:C.red} sm style={{marginLeft:6}}>{lr.tier} ({lr.total}/30)</Bdg></div>:<span style={{color:C.mid}}>—</span>;}},
          {h:"Interventions",r:r=><span style={{fontWeight:600,color:r.interventions.length>0?C.red:C.mid}}>{r.interventions.length}</span>},
          {h:"",r:()=><Btn v="ghost" sz="sm" ico="chvR">View</Btn>},
        ]} data={hrData} onRow={r=>setSel(r)}/>
      </div>}

      {tab==="reviews_due"&&<div>
        {upcomingReviews.length===0?<div style={{textAlign:"center",padding:60,color:C.mid}}><Ico d={ICONS.star} sz={48} c={C.mid}/><div style={{fontSize:16,fontWeight:600,marginTop:12}}>No Upcoming Reviews</div><div style={{fontSize:13,marginTop:6}}>All reviews are up to date.</div></div>
        :upcomingReviews.map(({emp,nextDate,daysUntil})=>{
          const isPastDue=daysUntil<0;
          const isUrgent=daysUntil>=0&&daysUntil<=10;
          const borderColor=isPastDue?C.red:isUrgent?C.org:C.blue;
          const badgeBg=isPastDue?"#FFCDD2":isUrgent?"#FFE0B2":C.blueLt;
          const badgeTx=isPastDue?C.redDk:isUrgent?"#E65100":C.blueDk;
          return <Crd key={emp.id} sty={{marginBottom:12,borderLeft:`4px solid ${borderColor}`,cursor:"pointer"}} onClick={()=>setSel(emp)}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <Avt name={emp.name} sz={36} c={borderColor}/>
                <div><div style={{fontSize:14,fontWeight:700,color:C.blk}}>{emp.name}</div><div style={{fontSize:12,color:C.mid}}>{users.find(u=>u.id===emp.uid)?.role} • {emp.stage}{emp.pip?" (PIP)":""}</div></div>
              </div>
              <Bdg c={badgeTx} bg={badgeBg}>{isPastDue?`${Math.abs(daysUntil)} days overdue`:daysUntil===0?"Due today":`${daysUntil} days`}</Bdg>
            </div>
            <div style={{fontSize:12,color:C.mid,marginTop:8}}>Review due: {nextDate.toLocaleDateString()}</div>
          </Crd>;
        })}
      </div>}

      {tab==="training"&&<div>
        {hrData.filter(h=>["Training","PDP"].includes(h.stage)).length===0?<div style={{textAlign:"center",padding:60,color:C.mid}}><Ico d={ICONS.star} sz={48} c={C.mid}/><div style={{fontSize:16,fontWeight:600,marginTop:12}}>No Active Trainees</div><div style={{fontSize:13,marginTop:6}}>Employees in training or PDP will appear here.</div></div>
        :<Tbl cols={[
          {h:"Employee",r:r=><span style={{fontWeight:600}}>{r.name}</span>},
          {h:"Stage",r:r=><SBdg status={r.stage} map={HR_STAGES}/>},
          {h:"Trainer",r:r=>r.training?.trainer||"—"},
          {h:"Start Date",r:r=>r.pdp?.start||r.hireDate},
        ]} data={hrData.filter(h=>["Training","PDP"].includes(h.stage))}/>}
      </div>}

      {tab==="pip"&&<Tbl cols={[
        {h:"Employee",r:r=><div style={{display:"flex",alignItems:"center",gap:10}}><Avt name={r.name} sz={28} c={C.red}/><span style={{fontWeight:600}}>{r.name}</span></div>},
        {h:"PIP Start",r:r=>r.pip?.start||"—"},
        {h:"PIP End",r:r=>r.pip?.end||"—"},
        {h:"Strikes",r:r=><span style={{fontWeight:700,color:C.red}}>{r.pip?.strikes||0}/3</span>},
        {h:"45-Day Review",r:r=>r.pip?.review45?<Bdg c={C.grn} sm>Completed</Bdg>:<Bdg c={C.org} sm>Pending</Bdg>},
      ]} data={hrData.filter(h=>h.stage==="PIP")} onRow={r=>setSel(r)}/>}
    </div>

    :<div>
      <button onClick={()=>{setSel(null);setDetailTab("timeline");}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.mid,marginBottom:16,fontFamily:"inherit"}}><Ico d={ICONS.back} sz={16}/> Back</button>

      <Crd sty={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <Avt name={sel.name} sz={48} c={HR_STAGES[sel.stage]?.tx||C.blue}/>
            <div><h3 style={{fontSize:20,fontWeight:700,color:C.blk,margin:0}}>{sel.name}</h3><div style={{fontSize:13,color:C.mid,marginTop:2}}>Hired: {sel.hireDate} • {users.find(u=>u.id===sel.uid)?.role}</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <SBdg status={sel.stage} map={HR_STAGES}/>
            <Btn v="blue" sz="sm" ico="edit" onClick={()=>setReviewModal(sel)}>New Review</Btn>
            <Btn v="secondary" sz="sm" ico="flag" onClick={()=>setInterventionModal(sel)}>Intervention</Btn>
          </div>
        </div>
      </Crd>

      <TabB tabs={[{id:"timeline",l:"Timeline"},{id:"reviews",l:"Reviews",n:sel.reviews.length},{id:"interventions",l:"Interventions",n:sel.interventions.length},{id:"training",l:"Training"},{id:"docs",l:"Documents",n:sel.docs.length}]} act={detailTab} set={setDetailTab}/>

      {detailTab==="timeline"&&<Crd>
        <h4 style={{fontSize:14,fontWeight:700,margin:"0 0 16px",color:C.blk}}>Employee Timeline</h4>
        {[
          {label:"Hired",date:sel.hireDate,color:C.blue,detail:"Onboarded to Ladybug Laundry"},
          ...(sel.training?[{label:"Training Complete",date:sel.training.result==="Ready for Performance Development Period"?"Passed":"In Progress",color:C.blue,detail:`Trainer: ${sel.training.trainer}`}]:[]),
          ...(sel.pdp?[{label:"PDP Started",date:sel.pdp.start,color:C.org,detail:`60-day Performance Development Period`}]:[]),
          ...(sel.pdp?.review30?[{label:"30-Day PDP Review",date:sel.pdp.review30.date,color:sel.pdp.review30.tier==="Proactive"?C.grn:sel.pdp.review30.tier==="Reactive"?C.org:C.red,detail:`${sel.pdp.review30.tier} (${sel.pdp.review30.total}/30) — ${sel.pdp.review30.notes}`}]:[]),
          ...(sel.pdp?.completed?[{label:"PDP Completed",date:sel.pdp.raiseDate||sel.pdp.end,color:C.grn,detail:sel.pdp.raiseDate?"Raise and PTO eligibility granted":"PDP period ended"}]:[]),
          ...sel.reviews.map(r=>({label:"Performance Review",date:r.date,color:r.tier==="Proactive"?C.grn:r.tier==="Reactive"?C.org:C.red,detail:`${r.tier} (${r.total}/30) — ${r.notes}`})),
          ...sel.interventions.map(i=>({label:i.type,date:i.date,color:C.red,detail:i.problem})),
          ...(sel.pip?[{label:"PIP Started",date:sel.pip.start,color:C.red,detail:`90-day Performance Improvement Period — ${sel.pip.strikes}/3 strikes`}]:[]),
        ].map((e,i)=><div key={i} style={{display:"flex",gap:12,marginBottom:16}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:10,height:10,borderRadius:"50%",backgroundColor:e.color,flexShrink:0}}/>{i<10&&<div style={{width:2,flex:1,backgroundColor:"#E5E7EB",marginTop:4}}/>}</div>
          <div style={{flex:1,paddingBottom:8}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,fontWeight:700,color:C.blk}}>{e.label}</span><span style={{fontSize:11,color:C.mid}}>{e.date}</span></div><div style={{fontSize:12,color:C.mid,marginTop:2}}>{e.detail}</div></div>
        </div>)}
      </Crd>}

      {detailTab==="reviews"&&<div>
        {sel.reviews.map((r,i)=><Crd key={i} sty={{marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div><span style={{fontSize:14,fontWeight:700,color:C.blk}}>Performance Review</span><span style={{fontSize:12,color:C.mid,marginLeft:8}}>{r.date}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20,fontWeight:700,color:C.blk}}>{r.total}/30</span><Bdg c={r.tier==="Proactive"?C.grn:r.tier==="Reactive"?C.org:C.red}>{r.tier}</Bdg></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
            {REVIEW_CATS.map((cat,j)=><div key={j} style={{padding:"8px 12px",backgroundColor:C.lt,borderRadius:6}}>
              <div style={{fontSize:11,color:C.mid}}>{cat}</div>
              <div style={{fontSize:16,fontWeight:700,color:r.scores[j]>=4?C.grn:r.scores[j]>=3?C.org:C.red}}>{r.scores[j]}/5</div>
            </div>)}
          </div>
          <div style={{fontSize:13,color:C.blk}}><strong>Notes:</strong> {r.notes}</div>
          <div style={{fontSize:12,color:C.mid,marginTop:4}}>Reviewed by: {r.by}</div>
        </Crd>)}
      </div>}

      {detailTab==="interventions"&&<div>
        {sel.interventions.length===0?<div style={{textAlign:"center",padding:40,color:C.mid,fontSize:13}}>No interventions on record</div>
        :sel.interventions.map((intv,i)=><Crd key={i} sty={{marginBottom:12,borderLeft:`3px solid ${C.red}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <Bdg c={C.red}>{intv.type}</Bdg><span style={{fontSize:12,color:C.mid}}>{intv.date} • {intv.loc}</span>
          </div>
          <div style={{fontSize:13,marginBottom:8}}><strong>Problem:</strong> {intv.problem}</div>
          <div style={{fontSize:13,marginBottom:8}}><strong>Expectations:</strong> {intv.expectations}</div>
          <div style={{fontSize:13,marginBottom:8}}><strong>Action Steps:</strong> {intv.actions}</div>
          <div style={{fontSize:12,color:C.mid}}>Handbook Ref: {intv.handbook} • Manager: {intv.manager}</div>
          {intv.probation&&<div style={{fontSize:12,color:C.red,fontWeight:600,marginTop:6}}>Probation until: {intv.probEnd}</div>}
        </Crd>)}
      </div>}

      {detailTab==="training"&&sel.training&&<Crd>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><h4 style={{fontSize:14,fontWeight:700,color:C.blk,margin:0}}>Training Record</h4><Bdg c={C.blue}>Trainer: {sel.training.trainer}</Bdg></div>
        {["week1","week2"].map((wk,wi)=><div key={wk} style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:C.blk,marginBottom:8}}>Week {wi+1}</div>
          <div style={{display:"grid",gap:4}}>
            {sel.training[wk].map((t,j)=><div key={j} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 12px",backgroundColor:C.lt,borderRadius:6,fontSize:12}}>
              <span>{t.cat}</span>
              <Bdg c={t.status==="Completed"?C.grn:t.status==="Partial"?C.org:C.red} sm>{t.status}</Bdg>
            </div>)}
          </div>
        </div>)}
        <div style={{padding:"12px 16px",backgroundColor:sel.training.result.includes("Ready")?C.grnLt:C.yelLt,borderRadius:8}}>
          <div style={{fontSize:13,fontWeight:600,color:sel.training.result.includes("Ready")?"#2E7D32":"#F57F17"}}>{sel.training.result}</div>
        </div>
      </Crd>}

      {detailTab==="docs"&&<Crd>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><h4 style={{fontSize:14,fontWeight:700,color:C.blk,margin:0}}>Documents</h4><Btn v="secondary" sz="sm" ico="plus">Upload</Btn></div>
        {sel.docs.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",backgroundColor:C.lt,borderRadius:6,marginBottom:6}}>
          <Ico d={ICONS.file} sz={14} c={C.mid}/><span style={{fontSize:13,color:C.blue,fontWeight:500,flex:1}}>{d}</span>
          <Btn v="ghost" sz="sm" ico="dl">Download</Btn>
        </div>)}
      </Crd>}

      {/* Performance Review Modal */}
      {reviewModal&&(()=>{const _C=()=>{
        const [scores,setScores]=useState([3,3,3,3,3,3]);const[notes,setNotes]=useState("");
        const total=scores.reduce((a,b)=>a+b,0);const tier=total>=21?"Proactive":total>=11?"Reactive":"Inactive";
        const save=()=>{const nr={date:now().split(" ")[0]||"03/30",scores:[...scores],total,tier,notes,by:user.name};
          const up={...sel,reviews:[...sel.reviews,nr],stage:tier==="Inactive"&&!sel.pip?"PIP":sel.stage};
          if(tier==="Inactive"&&!sel.pip){up.pip={start:now(),end:"06/28",review45:null,completed:false,strikes:(sel.pip?.strikes||0)+1};}
          setHrData(hrData.map(h=>h.id===sel.id?up:h));setSel(up);setReviewModal(null);};
        return <Modal title="Performance Review" onClose={()=>setReviewModal(null)} w="640px">
          <div style={{padding:"12px 16px",backgroundColor:C.lt,borderRadius:8,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700}}>Total: {total}/30</span>
            <Bdg c={tier==="Proactive"?C.grn:tier==="Reactive"?C.org:C.red}>{tier}</Bdg>
          </div>
          {REVIEW_CATS.map((cat,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}>
            <span style={{fontSize:13,flex:1}}>{cat}</span>
            <div style={{display:"flex",gap:4}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>{const ns=[...scores];ns[i]=n;setScores(ns);}} style={{width:32,height:32,borderRadius:6,border:scores[i]===n?`2px solid ${n>=4?C.grn:n>=3?C.org:C.red}`:"1px solid #E5E7EB",backgroundColor:scores[i]===n?`${n>=4?C.grn:n>=3?C.org:C.red}14`:C.wh,color:scores[i]===n?n>=4?C.grn:n>=3?C.org:C.red:C.mid,fontSize:13,fontWeight:700,cursor:"pointer"}}>{n}</button>)}</div>
          </div>)}
          <Field label="Supervisor Notes"><Txta val={notes} set={setNotes} ph="Address categories scoring 3 or below..." rows={4}/></Field>
          {tier==="Inactive"&&<div style={{padding:"12px 16px",backgroundColor:C.redLt,borderRadius:8,marginBottom:16,fontSize:13,color:C.redDk,fontWeight:600}}>⚠ Inactive classification — employee will be placed on PIP</div>}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setReviewModal(null)}>Cancel</Btn><Btn v="primary" onClick={save}>Submit Review</Btn></div>
        </Modal>;
        };return <_C/>;})()}

      {/* Intervention Modal */}
      {interventionModal&&(()=>{const _C=()=>{
        const [type,setType]=useState("Verbal Warning");const[problem,setProblem]=useState("");const[expect,setExpect]=useState("");const[actions,setActions]=useState("");const[handbook,setHandbook]=useState("");const[prob,setProb]=useState(false);const[probEnd,setProbEnd]=useState("");const[conseq,setConseq]=useState("");
        const save=()=>{if(!problem)return;const ni={id:Date.now(),type,date:now(),manager:user.name,loc:"Downtown",problem,expectations:expect,actions,handbook,probation:prob,probEnd:prob?probEnd:null,consequence:conseq};
          const strikes=(sel.interventions.length||0)+1; let newStage=sel.stage;
          if(type==="Final Warning"||type==="Termination"){newStage=type==="Termination"?"Terminated":"PIP";}
          const up={...sel,interventions:[...sel.interventions,ni],stage:newStage,pip:newStage==="PIP"?{start:now(),end:"06/30",review45:null,completed:false,strikes}:sel.pip};
          setHrData(hrData.map(h=>h.id===sel.id?up:h));setSel(up);setInterventionModal(null);};
        return <Modal title="Intervention Form" onClose={()=>setInterventionModal(null)} w="660px">
          <div style={{display:"flex",gap:8,marginBottom:16}}>{["Verbal Warning","Written Warning","Final Warning","Termination"].map(t=><button key={t} onClick={()=>setType(t)} style={{padding:"8px 14px",borderRadius:8,border:type===t?`2px solid ${t==="Termination"?C.red:C.blue}`:"1px solid #E5E7EB",backgroundColor:type===t?`${t==="Termination"?C.red:C.blue}14`:C.wh,fontSize:12,fontWeight:600,cursor:"pointer",color:type===t?t==="Termination"?C.red:C.blue:C.mid,fontFamily:"inherit"}}>{t}</button>)}</div>
          <Field label="Performance or Behavior Problem (Be specific)"><Txta val={problem} set={setProblem} ph="Describe the specific issue..." rows={3}/></Field>
          <Field label="Performance Expectations"><Txta val={expect} set={setExpect} ph="What is expected going forward..." rows={2}/></Field>
          <Field label="Action Steps"><Txta val={actions} set={setActions} ph="What will be done to fix the problem..." rows={2}/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Handbook Section/Paragraph"><Inp val={handbook} set={setHandbook} ph="e.g. Section 4, Paragraph 2"/></Field>
            <Field label="Start Probation?"><div style={{display:"flex",alignItems:"center",gap:12,paddingTop:4}}>
              <label style={{display:"flex",alignItems:"center",gap:4,fontSize:13,cursor:"pointer"}}><input type="radio" checked={prob} onChange={()=>setProb(true)}/> Yes</label>
              <label style={{display:"flex",alignItems:"center",gap:4,fontSize:13,cursor:"pointer"}}><input type="radio" checked={!prob} onChange={()=>setProb(false)}/> No</label>
            </div></Field>
          </div>
          {prob&&<Field label="Probationary Period End Date"><Inp val={probEnd} set={setProbEnd} type="date"/></Field>}
          <Field label="Consequence if not fixed"><Txta val={conseq} set={setConseq} ph="Consequence if performance/behavior is not fixed..." rows={2}/></Field>
          <div style={{padding:"10px 14px",backgroundColor:C.lt,borderRadius:8,marginBottom:16,fontSize:11,color:C.mid}}>
            <strong>Note:</strong> This form requires the employee's digital acknowledgment. After submission, the employee will be prompted to sign under their own account. Signing is not an admission of guilt — it confirms receipt of this document. Refusal to sign is considered insubordination.
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setInterventionModal(null)}>Cancel</Btn><Btn v={type==="Termination"?"danger":"primary"} onClick={save}>{type==="Termination"?"Process Termination":"Submit Intervention"}</Btn></div>
        </Modal>;
        };return <_C/>;})()}
    </div>}
  </div>;
};

/* ============================================================
   REPORTS
   ============================================================ */
const Reports = () => {
  const {orders,maint,tasks,customers,locations} = useApp();
  const [tab,setTab] = useState("sales");
  const tabs=[{id:"sales",l:"Sales"},{id:"tasks",l:"Tasks"},{id:"maint",l:"Maintenance"},{id:"cs",l:"Customer Service"},{id:"ta",l:"Attendance"},{id:"inv",l:"Inventory"},{id:"proj",l:"Projects"},{id:"hr",l:"HR"}];

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <h2 style={{fontSize:22,fontWeight:700,color:C.blk,margin:0}}>Reports</h2>
      <div style={{display:"flex",gap:8}}><Btn v="secondary" ico="dl">Export PDF</Btn><Btn v="secondary" ico="dl">Export CSV</Btn></div>
    </div>
    <TabB tabs={tabs} act={tab} set={setTab}/>
    {tab==="sales"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        <Stat label="Today's Revenue" value={`$${orders.reduce((s,o)=>s+o.total,0).toFixed(2)}`} ico="$" c={C.grn}/>
        <Stat label="Orders Today" value={orders.length} ico="clip" c={C.blue}/>
        <Stat label="Avg Order Value" value={`$${(orders.reduce((s,o)=>s+o.total,0)/orders.length).toFixed(2)}`} ico="$" c={C.purp}/>
        <Stat label="Customers" value={customers.length} ico="usr" c={C.org}/>
      </div>
    </div>}
    {tab==="tasks"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
      {locations.map(l=>{const lt=tasks[l.id]||[];const d=lt.filter(t=>t.done).length;const t=lt.length;const p=t?Math.round(d/t*100):0;
        return <Crd key={l.id}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:15,fontWeight:700,color:C.blk}}>{l.name}</span><span style={{fontSize:20,fontWeight:700,color:p===100?C.grn:p>=50?C.org:C.red}}>{p}%</span></div><div style={{height:6,backgroundColor:C.lt,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,backgroundColor:p===100?C.grn:p>=50?C.org:C.red,borderRadius:3}}/></div><div style={{fontSize:12,color:C.mid,marginTop:8}}>{d}/{t} completed</div></Crd>;
      })}
    </div>}
    {tab==="maint"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
      <Stat label="Active Issues" value={maint.filter(r=>r.status!=="Fixed").length} ico="alert" c={C.red}/>
      <Stat label="Resolved" value={maint.filter(r=>r.status==="Fixed").length} ico="tick" c={C.grn}/>
      <Stat label="Avg Resolution" value="2.3d" ico="clk" c={C.blue}/>
      <Stat label="Total Costs" value={`$${maint.reduce((s,r)=>s+r.parts.reduce((ps,p)=>ps+p.cost,0),0).toFixed(2)}`} ico="$" c={C.org}/>
    </div>}
    {(tab==="cs"||tab==="ta")&&<div style={{textAlign:"center",padding:60,color:C.mid}}><Ico d={ICONS.bar} sz={48} c={C.mid}/><div style={{fontSize:16,fontWeight:600,marginTop:12}}>Detailed Reports</div><div style={{fontSize:13,marginTop:6}}>Comprehensive {tab==="cs"?"customer service":"attendance"} analytics with export capability.</div></div>}
    {tab==="inv"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
      <Stat label="Total Items Tracked" value="7" ico="box" c={C.blue}/>
      <Stat label="Low Stock Items" value="2" ico="alert" c={C.org}/>
      <Stat label="Transfers This Month" value="4" ico="truck" c={C.purp}/>
      <Stat label="Total Inventory Value" value="$12,450" ico="$" c={C.grn}/>
    </div>}
    {tab==="proj"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
      <Stat label="Active Projects" value="2" ico="bldg" c={C.blue}/>
      <Stat label="Completed" value="1" ico="tick" c={C.grn}/>
      <Stat label="Total Budget" value="$38.5k" ico="$" c={C.purp}/>
      <Stat label="Budget Utilization" value="46%" ico="bar" c={C.org}/>
    </div>}
    {tab==="hr"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
      <Stat label="Active Employees" value="6" ico="usr" c={C.grn}/>
      <Stat label="On PIP" value="1" ico="alert" c={C.red}/>
      <Stat label="Avg Review Score" value="24.3" ico="star" c={C.blue}/>
      <Stat label="Interventions (90d)" value="2" ico="flag" c={C.org}/>
    </div>}
  </div>;
};

/* ============================================================
   USER SWITCHER (for demo purposes)
   ============================================================ */
const UserSwitcher = ({users,current,setCurrent}) => {
  const [open,setOpen] = useState(false);
  return <div style={{position:"relative"}}>
    <button onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:C.wh,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
      <Avt name={current.name} sz={24} c={C.blue}/><span style={{fontWeight:600}}>{current.name}</span><span style={{color:C.mid}}>({current.role})</span><Ico d={ICONS.chvD} sz={14} c={C.mid}/>
    </button>
    {open&&<div style={{position:"absolute",top:"100%",left:0,marginTop:4,backgroundColor:C.wh,borderRadius:8,border:"1px solid #E5E7EB",boxShadow:"0 4px 12px rgba(0,0,0,.1)",zIndex:200,minWidth:260,overflow:"hidden"}}>
      <div style={{padding:"8px 12px",fontSize:11,fontWeight:600,color:C.mid,textTransform:"uppercase",borderBottom:"1px solid #E5E7EB"}}>Switch User (Demo)</div>
      {users.map(u=><button key={u.id} onClick={()=>{setCurrent(u);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",border:"none",background:u.id===current.id?C.lt:"transparent",cursor:"pointer",fontSize:12,fontFamily:"inherit",textAlign:"left"}}><Avt name={u.name} sz={24} c={u.role==="Administrator"?C.red:C.blue}/><div><div style={{fontWeight:600}}>{u.name}</div><div style={{color:C.mid,fontSize:11}}>{u.role}</div></div></button>)}
    </div>}
  </div>;
};

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [mod,setMod] = useState("dash");
  const [loc,setLoc] = useState(1);
  const [showNotif,setShowNotif] = useState(false);
  const [col,setCol] = useState(false);
  const [user,setUser] = useState(initUsers()[0]);
  const [users] = useState(initUsers);
  const [locations] = useState(initLocations);
  const [products,setProducts] = useState(initProducts);
  const [categories] = useState(initCategories);
  const [customers,setCustomers] = useState(initCustomers);
  const [orders,setOrders] = useState(initOrders);
  const [tasks,setTasks] = useState(initTasks);
  const [maint,setMaint] = useState(initMaint);
  const [msgs,setMsgs] = useState(initMsgs);
  const [groups,setGroups] = useState(initGroups);
  const [tickets,setTickets] = useState(initTickets);
  const [scheds,setScheds] = useState(initScheds);
  const [kb,setKB] = useState(initKB);
  const [notifs,setNotifs] = useState(initNotifs);

  const unreadN = notifs.filter(n=>!n.read).length;
  const userLocs = locations.filter(l=>user.locations.includes(l.id));

  const ctx = {user,users,locations,selectedLoc:loc,products,setProducts,categories,customers,setCustomers,orders,setOrders,tasks,setTasks,maint,setMaint,msgs,setMsgs,groups,setGroups,tickets,setTickets,scheds,setScheds,kb,setKB};

  const render = () => {
    switch(mod){
      case "dash":return <Dashboard/>;
      case "sales":return <Sales/>;
      case "tasks":return <Tasks/>;
      case "maint":return <Maint/>;
      case "comm":return <Comm/>;
      case "cs":return <CS/>;
      case "ta":return <TA/>;
      case "kb":return <KB/>;
      case "inv":return <Inventory/>;
      case "proj":return <Projects/>;
      case "hr":return <HR/>;
      case "reports":return <Reports/>;
      default:return <Dashboard/>;
    }
  };

  return <AppContext.Provider value={ctx}>
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",backgroundColor:"#F8F9FB"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <Sidebar active={mod} go={setMod} col={col}/>
      <div style={{flex:1,marginLeft:col?68:240,transition:"margin-left .2s"}}>
        {/* Top Bar */}
        <div style={{height:60,backgroundColor:C.wh,borderBottom:"1px solid #E5E7EB",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:40}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <button onClick={()=>setCol(!col)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Ico d={ICONS.menu} sz={20} c={C.mid}/></button>
            {userLocs.length>1&&<Sel val={loc} set={v=>setLoc(+v)} opts={userLocs.map(l=>({v:l.id,l:l.name}))} sty={{minWidth:180}}/>}
            <UserSwitcher users={users} current={user} setCurrent={setUser}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,position:"relative"}}>
            <button onClick={()=>setShowNotif(!showNotif)} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:8,borderRadius:8}}>
              <Ico d={ICONS.bell} sz={20} c={C.mid}/>
              {unreadN>0&&<div style={{position:"absolute",top:4,right:4,width:16,height:16,borderRadius:"50%",backgroundColor:C.red,color:C.wh,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadN}</div>}
            </button>
            {showNotif&&<NotifPanel notifs={notifs} setNotifs={setNotifs} close={()=>setShowNotif(false)}/>}
            <button style={{background:"none",border:"none",cursor:"pointer",padding:8,borderRadius:8}}><Ico d={ICONS.set} sz={20} c={C.mid}/></button>
          </div>
        </div>
        <div style={{padding:28}}>{render()}</div>
      </div>
    </div>
  </AppContext.Provider>;
}