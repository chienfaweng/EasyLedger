"use client";

import { useMemo, useState } from "react";

type Tx = { id:number; title:string; category:string; date:string; amount:number; icon:string; color:string; kind:"expense"|"income"|"transfer"; fromAccount?:string; toAccount?:string };
type Tab = "home"|"detail"|"add"|"report"|"me";

const initialTx: Tx[] = [
  { id:1, title:"午餐", category:"餐飲", date:"2026-07-16", amount:-120, icon:"餐", color:"coral", kind:"expense" },
  { id:2, title:"捷運", category:"交通", date:"2026-07-16", amount:-30, icon:"車", color:"blue", kind:"expense" },
  { id:7, title:"現金轉入銀行", category:"轉帳", date:"2026-07-16", amount:5000, icon:"轉", color:"blue", kind:"transfer", fromAccount:"現金", toAccount:"台新銀行" },
  { id:3, title:"全聯採買", category:"購物", date:"2026-07-15", amount:-860, icon:"購", color:"amber", kind:"expense" },
  { id:4, title:"薪資", category:"薪資", date:"2026-07-15", amount:68000, icon:"薪", color:"green", kind:"income" },
  { id:5, title:"咖啡", category:"餐飲", date:"2026-07-14", amount:-95, icon:"飲", color:"coral", kind:"expense" },
  { id:6, title:"電信費", category:"電信網路", date:"2026-07-12", amount:-699, icon:"訊", color:"violet", kind:"expense" },
];
const expenseCats = ["餐飲","交通","購物","居家","水電瓦斯","電信網路","娛樂","醫療健康","運動","旅遊","教育","保險","稅費","人情","寵物","其他"];
const incomeCats = ["薪資","獎金","投資收益","利息","租金","退款","兼職","其他收入"];

const money = (n:number) => `${n < 0 ? "−" : n > 0 ? "+" : ""}NT$ ${Math.abs(n).toLocaleString("zh-TW")}`;

export default function Home() {
  const [tab,setTab]=useState<Tab>("home");
  const [hidden,setHidden]=useState(false);
  const [year,setYear]=useState(2026);
  const [month,setMonth]=useState(7);
  const [txs,setTxs]=useState<Tx[]>(initialTx);
  const [type,setType]=useState<"expense"|"income"|"transfer">("expense");
  const [amount,setAmount]=useState("");
  const [category,setCategory]=useState("餐飲");
  const [account,setAccount]=useState("現金");
  const [destinationAccount,setDestinationAccount]=useState("台新銀行");
  const [note,setNote]=useState("");
  const [toast,setToast]=useState("");
  const [filter,setFilter]=useState("全部");
  const [selected,setSelected]=useState<Tx|null>(null);
  const [meSection,setMeSection]=useState<string|null>(null);

  const income=txs.filter(x=>x.kind==="income").reduce((a,b)=>a+b.amount,0);
  const expense=Math.abs(txs.filter(x=>x.kind==="expense").reduce((a,b)=>a+b.amount,0));
  const balance=income-expense;
  const totalAssets=128560+(balance-66196);
  const masked=(value:string)=>hidden?"••••••":value;
  const showToast=(s:string)=>{setToast(s);setTimeout(()=>setToast(""),2200)};
  const changeMonth=(d:number)=>{
    setMonth(m=>{
      const next=m+d;
      if(next<1){setYear(y=>y-1);return 12}
      if(next>12){setYear(y=>y+1);return 1}
      return next;
    });
  };

  const save=()=>{
    const value=Number(amount);
    if(!value || value<=0){showToast("請先輸入金額");return}
    if(type==="transfer"){
      if(account===destinationAccount){showToast("轉出與轉入帳戶不可相同");return}
      const transferItem:Tx={id:Date.now(),title:note||`${account}轉入${destinationAccount}`,category:"轉帳",date:"2026-07-16",amount:value,icon:"轉",color:"blue",kind:"transfer",fromAccount:account,toAccount:destinationAccount};
      setTxs(v=>[transferItem,...v]);setNote("");
      showToast(`已完成 ${account} → ${destinationAccount} 轉帳`);setTab("home");setAmount("");return
    }
    const isIncome=type==="income";
    const item:Tx={id:Date.now(),title:note||category,category,date:"2026-07-16",amount:isIncome?value:-value,icon:isIncome?"收":category.slice(0,1),color:isIncome?"green":"coral",kind:isIncome?"income":"expense"};
    setTxs(v=>[item,...v]); setAmount("");setNote("");showToast("記帳成功");setTab("home");
  };
  const remove=(id:number)=>{setTxs(v=>v.filter(x=>x.id!==id));setSelected(null);showToast("已移至垃圾桶，可於 30 天內復原")};

  return <main className="stage">
    <div className="phone-shell">
      <header className="topbar">
        <div>{tab==="me"&&meSection?<button className="back-link" onClick={()=>setMeSection(null)}>‹ 返回</button>:<span className="eyebrow">EasyLedger</span>}<h1>{tab==="home"?"簡單記帳":tab==="detail"?"交易明細":tab==="report"?"報表":tab==="me"?(meSection||"我的帳戶"):"快速記帳"}</h1></div>
        {tab==="home"&&<button className="icon-btn" aria-label="通知" onClick={()=>showToast("目前沒有新通知")}>♢<span className="dot"/></button>}
      </header>

      <section className="screen">
        {tab==="home"&&<HomeView hidden={hidden} masked={masked} year={year} month={month} changeMonth={changeMonth} setHidden={setHidden} income={income} expense={expense} balance={balance} totalAssets={totalAssets} txs={txs} open={(x)=>setSelected(x)} go={setTab}/>} 
        {tab==="detail"&&<DetailView txs={txs} filter={filter} setFilter={setFilter} open={setSelected}/>} 
        {tab==="add"&&<AddView type={type} setType={setType} amount={amount} setAmount={setAmount} category={category} setCategory={setCategory} account={account} setAccount={setAccount} destinationAccount={destinationAccount} setDestinationAccount={setDestinationAccount} note={note} setNote={setNote} save={save}/>} 
        {tab==="report"&&<ReportView year={year} month={month} changeMonth={changeMonth} income={income} expense={expense}/>} 
        {tab==="me"&&(meSection?<MeDetail section={meSection} showToast={showToast}/>:<MeView showToast={showToast} onOpen={setMeSection}/>)} 
      </section>

      <nav className="bottom-nav" aria-label="主要導覽">
        <Nav active={tab==="home"} icon="⌂" label="首頁" onClick={()=>setTab("home")}/>
        <Nav active={tab==="detail"} icon="☷" label="明細" onClick={()=>setTab("detail")}/>
        <button className="add-nav" onClick={()=>setTab("add")} aria-label="記帳"><span>＋</span><b>記帳</b></button>
        <Nav active={tab==="report"} icon="▥" label="報表" onClick={()=>setTab("report")}/>
        <Nav active={tab==="me"} icon="♙" label="我的" onClick={()=>{setTab("me");setMeSection(null)}}/>
      </nav>
    </div>
    {toast&&<div className="toast">✓ {toast}</div>}
    {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="sheet" onClick={e=>e.stopPropagation()}><div className="grab"/><div className={`tx-icon ${selected.color}`}>{selected.icon}</div><h2>{selected.title}</h2><p className={selected.kind==="transfer"?"transfer-amount":selected.kind==="income"?"income":"expense"}>{selected.kind==="transfer"?`NT$ ${selected.amount.toLocaleString()}`:money(selected.amount)}</p><dl><div><dt>分類</dt><dd>{selected.category}</dd></div><div><dt>日期</dt><dd>{selected.date}</dd></div>{selected.kind==="transfer"?<><div><dt>轉出帳戶</dt><dd>{selected.fromAccount}</dd></div><div><dt>轉入帳戶</dt><dd>{selected.toAccount}</dd></div></>:<div><dt>帳戶</dt><dd>現金</dd></div>}</dl><div className="sheet-actions"><button onClick={()=>showToast("編輯功能示意")}>編輯</button><button className="danger" onClick={()=>remove(selected.id)}>刪除</button></div></div></div>}
  </main>
}

function HomeView(p:any){return <div className="stack">
  <div className="month-switch"><button aria-label="前一個月" onClick={()=>p.changeMonth(-1)}>‹</button><strong>▣　{p.year} 年 {p.month} 月</strong><button aria-label="後一個月" onClick={()=>p.changeMonth(1)}>›</button></div>
  <article className="asset-card"><div className="asset-top"><span>總資產</span><button onClick={()=>p.setHidden(!p.hidden)}>{p.hidden?"顯示":"隱藏"}</button></div><div className="asset-value">{p.masked(`NT$ ${p.totalAssets.toLocaleString()}`)}</div><small>較上月增加 NT$ 3,240　↗</small></article>
  <div className="summary-card"><Metric label="本月收入" value={p.masked(money(p.income))} cls="income"/><Metric label="本月支出" value={p.masked(money(-p.expense))} cls="expense"/><Metric label="本月結餘" value={p.masked(money(p.balance))} cls="balance"/></div>
  <button className="budget-card" onClick={()=>p.go("report")}><div><b>本月預算</b><span>61%</span></div><div className="progress"><i/></div><p>已使用 NT$ 24,380　・　剩餘 <strong>NT$ 15,620</strong></p></button>
  <section className="recent card"><div className="section-head"><h2>最近交易</h2><button onClick={()=>p.go("detail")}>查看全部　›</button></div>{p.txs.slice(0,4).map((x:Tx)=><TxRow key={x.id} tx={x} onClick={()=>p.open(x)}/>)}</section>
</div>}

function Metric({label,value,cls}:{label:string,value:string,cls:string}){return <div className="metric"><span className={cls}>{label}</span><strong>{value}</strong></div>}
function TxRow({tx,onClick}:{tx:Tx,onClick:()=>void}){return <button className="tx-row" onClick={onClick}><span className={`tx-icon ${tx.color}`}>{tx.icon}</span><span className="tx-main"><b>{tx.title}</b><small>{tx.kind==="transfer"?`${tx.fromAccount} → ${tx.toAccount}`:`${tx.category} ・ ${tx.date.slice(5).replace("-","/")}`}</small></span><strong className={tx.kind==="transfer"?"transfer-amount":tx.kind==="income"?"income":"expense"}>{tx.kind==="transfer"?`NT$ ${tx.amount.toLocaleString()}`:money(tx.amount)}</strong><span className="chev">›</span></button>}

function DetailView({txs,filter,setFilter,open}:any){
  const kindMap:any={"支出":"expense","收入":"income","轉帳":"transfer"};
  const visible=filter==="全部"||filter==="篩選"?txs:txs.filter((x:Tx)=>x.kind===kindMap[filter]);
  const groups=useMemo(()=>Object.entries(visible.reduce((a:any,x:Tx)=>{(a[x.date]??=[]).push(x);return a},{})),[visible]);
  return <div className="stack"><div className="search">⌕　搜尋商家、備註或分類</div><div className="chips">{["全部","支出","收入","轉帳","篩選"].map(x=><button className={filter==x?"active":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div>{groups.map(([date,items]:any)=><section className="day-group" key={date}><div className="day-head"><b>{date.replaceAll("-"," / ")}</b><span>{filter==="轉帳"?`轉帳 ${items.length} 筆`:`支出 NT$ ${Math.abs(items.filter((x:Tx)=>x.kind==="expense").reduce((a:number,b:Tx)=>a+b.amount,0)).toLocaleString()}`}</span></div>{items.map((x:Tx)=><TxRow tx={x} key={x.id} onClick={()=>open(x)}/>)}</section>)}</div>
}

function AddView(p:any){const keys=["1","2","3","4","5","6","7","8","9","00","0","⌫"];const key=(k:string)=>{if(k==="⌫")p.setAmount((v:string)=>v.slice(0,-1));else if(p.amount.length<9)p.setAmount((v:string)=>v+k)};const changeType=(v:string)=>{p.setType(v);if(v==="expense")p.setCategory("餐飲");if(v==="income")p.setCategory("薪資")};const currentCats=p.type==="income"?incomeCats:expenseCats;return <div className="add-view">
  <div className="type-switch">{[["expense","支出"],["income","收入"],["transfer","轉帳"]].map(([v,l])=><button className={p.type==v?"active":""} onClick={()=>changeType(v)} key={v}>{l}</button>)}</div>
  <div className="amount-entry"><small>輸入金額</small><strong>NT$ {p.amount?Number(p.amount).toLocaleString():"0"}</strong></div>
  <div className="form-grid">
    {p.type!=="transfer"&&<label>分類<select value={p.category} onChange={e=>p.setCategory(e.target.value)}>{currentCats.map((x:string)=><option key={x}>{x}</option>)}</select></label>}
    <label className={p.type==="transfer"?"":""}>{p.type==="transfer"?"轉出帳戶":"帳戶"}<select value={p.account} onChange={e=>p.setAccount(e.target.value)}><option>現金</option><option>台新銀行</option><option>信用卡</option></select></label>
    {p.type==="transfer"&&<label>轉入帳戶<select value={p.destinationAccount} onChange={e=>p.setDestinationAccount(e.target.value)}><option>台新銀行</option><option>現金</option><option>信用卡</option></select></label>}
    <label className="wide">備註<input value={p.note} onChange={e=>p.setNote(e.target.value)} placeholder="例如：午餐、捷運"/></label>
  </div>
  <div className="keypad">{keys.map(k=><button onClick={()=>key(k)} key={k}>{k}</button>)}</div><button className="save-btn" onClick={p.save}>儲存這筆{p.type==="expense"?"支出":p.type==="income"?"收入":"轉帳"}</button>
</div>}

function ReportView({year,month,changeMonth,income,expense}:any){
  const [accountFilter,setAccountFilter]=useState("全部帳戶");
  const isCurrent=year===2026&&month===7;
  const reportIncome=isCurrent?income:year===2026&&month===6?62000:0;
  const reportExpense=isCurrent?expense:year===2026&&month===6?28940:0;
  const total=reportExpense||1;
  const data=isCurrent?[{n:"餐飲",v:1215,c:"#ff7668"},{n:"購物",v:860,c:"#f4aa4b"},{n:"電信網路",v:699,c:"#806bd8"},{n:"交通",v:30,c:"#4799dc"}]:year===2026&&month===6?[{n:"居家",v:18000,c:"#ff7668"},{n:"餐飲",v:6420,c:"#f4aa4b"},{n:"交通",v:2760,c:"#806bd8"},{n:"其他",v:1760,c:"#4799dc"}]:[];
  const trendMonths=Array.from({length:6},(_,i)=>{const d=new Date(year,month-6+i,1);return d.getMonth()+1});
  return <div className="stack"><div className="period"><button aria-label="前一個月" onClick={()=>changeMonth(-1)}>‹</button><b>{year} 年 {month} 月</b><button aria-label="後一個月" onClick={()=>changeMonth(1)}>›</button></div><div className="report-summary card"><span>本月結餘</span><strong>{money(reportIncome-reportExpense)}</strong><div><small>收入 {money(reportIncome)}</small><small>支出 {money(-reportExpense)}</small></div></div><section className="card chart-card"><div className="section-head"><h2>支出分類</h2><label className="account-filter"><span className="sr-only">篩選帳戶</span><select aria-label="篩選帳戶" value={accountFilter} onChange={e=>setAccountFilter(e.target.value)}><option>全部帳戶</option><option>現金</option><option>台新銀行</option><option>電子支付</option></select></label></div>{data.length?<><div className="filter-caption">目前顯示：{accountFilter}</div><div className="donut" style={{background:`conic-gradient(#ff7668 0 44%,#f4aa4b 44% 76%,#806bd8 76% 98%,#4799dc 98%)`}}><div><small>總支出</small><b>NT$ {reportExpense.toLocaleString()}</b></div></div>{data.map(x=><div className="legend" key={x.n}><i style={{background:x.c}}/><b>{x.n}</b><span>{Math.round(x.v/total*100)}%</span><strong>NT$ {x.v.toLocaleString()}</strong></div>)}</>:<div className="empty-report"><span>▥</span><b>本月尚無交易資料</b><small>新增記帳後，報表會自動更新</small></div>}</section><section className="card"><div className="section-head"><h2>近 6 個月趨勢</h2></div><div className="bars">{[45,62,51,80,67,58].map((h,i)=><div key={i}><i style={{height:`${data.length?h:8}%`}}/><small>{trendMonths[i]}月</small></div>)}</div></section></div>
}

function MeView({showToast,onOpen}:any){const items=[{name:"帳戶管理",icon:"▣"},{name:"分類管理",icon:"◉"},{name:"預算管理",icon:"◎"},{name:"固定收支",icon:"↻"},{name:"通知設定",icon:"♢"},{name:"外觀與安全",icon:"◒"},{name:"匯出資料",icon:"⇧"},{name:"說明中心",icon:"?"}];return <div className="stack"><div className="profile card"><div className="avatar">建</div><div><h2>建發</h2><p>個人帳本・TWD</p></div><button onClick={()=>showToast("個人資料已是最新狀態")}>編輯</button></div><div className="quick-stats"><div><b>3</b><span>帳戶</span></div><div><b>61%</b><span>預算使用</span></div><div><b>6</b><span>本月交易</span></div></div><section className="menu card">{items.map(x=><button key={x.name} onClick={()=>onOpen(x.name)}><span className="menu-icon">{x.icon}</span><b>{x.name}</b><span>›</span></button>)}</section><p className="version">EasyLedger 簡單記帳　V1.0 Prototype</p></div>}

const detailData:any={
  "帳戶管理":{intro:"管理資產與付款來源",action:"新增帳戶",rows:[["現金","NT$ 8,560","現金"],["台新銀行","NT$ 120,000","銀行"],["信用卡","−NT$ 3,280","信用卡"]]},
  "分類管理":{intro:"自訂收支分類與顯示順序",action:"新增分類",rows:[["餐飲","16 筆","支出"],["交通","8 筆","支出"],["薪資","1 筆","收入"],["旅遊","3 筆","支出"]]},
  "預算管理":{intro:"掌握每月可用金額",action:"新增預算",progress:true,rows:[["本月總預算","NT$ 40,000","已使用 61%"],["餐飲預算","NT$ 8,000","已使用 42%"],["交通預算","NT$ 3,000","已使用 28%"]]},
  "固定收支":{intro:"管理定期發生的收支",action:"新增固定收支",rows:[["網路月租","每月 5 日","−NT$ 699"],["房屋租金","每月 1 日","−NT$ 18,000"],["薪資","每月 5 日","+NT$ 68,000"]]},
  "通知設定":{intro:"選擇您想收到的提醒",toggles:["每日記帳提醒","預算達標提醒","信用卡繳款提醒","每週摘要","每月報告"]},
  "外觀與安全":{intro:"保護財務資料與調整顯示",toggles:["Face ID 解鎖","離開後自動鎖定","背景畫面模糊","預設隱藏金額"],rows:[["外觀模式","跟隨系統",""],["字體大小","標準",""]]},
  "匯出資料":{intro:"下載或備份您的記帳紀錄",action:"開始匯出",rows:[["CSV 交易明細","適合試算表","全部欄位"],["PDF 月報表","適合閱讀分享","圖表摘要"],["完整資料備份","用於資料復原","JSON"]]},
  "說明中心":{intro:"常見問題與支援",rows:[["如何新增第一筆記帳？","快速入門",""],["轉帳為何不算支出？","帳務觀念",""],["信用卡繳款怎麼記？","信用卡",""],["資料是否安全？","隱私與安全",""],["聯絡客服","service@easyledger.tw",""]]}
};

function MeDetail({section,showToast}:any){const d=detailData[section];const [switches,setSwitches]=useState<Record<number,boolean>>({0:true,1:true,2:true,3:false,4:true});if(section==="帳戶管理")return <AccountManager showToast={showToast}/>;return <div className="stack detail-panel"><div className="detail-intro"><span className="feature-mark">{section.slice(0,1)}</span><div><h2>{section}</h2><p>{d.intro}</p></div></div>{d.progress&&<div className="mini-budget card"><div><b>本月整體進度</b><strong>61%</strong></div><div className="progress"><i/></div><small>剩餘 NT$ 15,620</small></div>}{d.toggles&&<section className="setting-list card">{d.toggles.map((x:string,i:number)=><div key={x}><span><b>{x}</b><small>{i===0?"每天晚上 9:00":"可隨時變更"}</small></span><button className={`toggle ${switches[i]?"on":""}`} onClick={()=>setSwitches(v=>({...v,[i]:!v[i]}))} aria-label={`${x}${switches[i]?"已開啟":"已關閉"}`}><i/></button></div>)}</section>}{d.rows&&<section className="feature-list card">{d.rows.map((r:string[],i:number)=><button key={r[0]} onClick={()=>showToast(`${r[0]}內容已開啟`)}><span className="row-symbol">{i+1}</span><span><b>{r[0]}</b><small>{r[2]}</small></span><strong>{r[1]}</strong><em>›</em></button>)}</section>}{d.action&&<button className="primary-action" onClick={()=>showToast(`${d.action}功能已開啟`)}>＋ {d.action}</button>}</div>}

type Account={id:number;name:string;type:string;balance:number;included:boolean;icon:string};
function AccountManager({showToast}:any){
  const [accounts,setAccounts]=useState<Account[]>([{id:1,name:"現金",type:"現金",balance:8560,included:true,icon:"現"},{id:2,name:"台新銀行",type:"銀行帳戶",balance:120000,included:true,icon:"銀"},{id:3,name:"日常信用卡",type:"信用卡",balance:-3280,included:true,icon:"卡"}]);
  const [adding,setAdding]=useState(false);
  const [form,setForm]=useState({name:"",type:"現金",balance:"",included:true});
  const update=(k:string,v:string|boolean)=>setForm(f=>({...f,[k]:v}));
  const addAccount=()=>{if(!form.name.trim()){showToast("請輸入帳戶名稱");return}const balance=Number(form.balance||0);setAccounts(v=>[...v,{id:Date.now(),name:form.name.trim(),type:form.type,balance,included:form.included,icon:form.type.slice(0,1)}]);setForm({name:"",type:"現金",balance:"",included:true});setAdding(false);showToast("帳戶新增成功")};
  const assets=accounts.filter(a=>a.included).reduce((sum,a)=>sum+a.balance,0);
  return <div className="stack detail-panel"><div className="detail-intro"><span className="feature-mark">帳</span><div><h2>帳戶管理</h2><p>管理現金、銀行與付款帳戶</p></div></div><div className="account-total card"><span>納入總資產</span><strong>NT$ {assets.toLocaleString()}</strong><small>{accounts.filter(a=>a.included).length} 個帳戶已納入計算</small></div><section className="account-list card">{accounts.map(a=><button key={a.id} onClick={()=>showToast(`${a.name}帳戶內容已開啟`)}><span className={`account-icon ${a.balance<0?"debt":""}`}>{a.icon}</span><span><b>{a.name}</b><small>{a.type}・{a.included?"計入總資產":"不計入總資產"}</small></span><strong className={a.balance<0?"expense":""}>{a.balance<0?"−":""}NT$ {Math.abs(a.balance).toLocaleString()}</strong><em>›</em></button>)}</section>{!adding?<button className="primary-action" onClick={()=>setAdding(true)}>＋ 新增帳戶</button>:<section className="add-account-form card"><div className="form-title"><b>新增帳戶</b><button onClick={()=>setAdding(false)} aria-label="關閉新增帳戶">×</button></div><label>帳戶名稱<input value={form.name} onChange={e=>update("name",e.target.value)} placeholder="例如：國泰銀行、旅遊現金"/></label><label>帳戶類型<select value={form.type} onChange={e=>update("type",e.target.value)}><option>現金</option><option>銀行帳戶</option><option>信用卡</option><option>電子支付</option><option>投資帳戶</option><option>其他</option></select></label><label>初始餘額<div className="balance-input"><span>NT$</span><input inputMode="numeric" value={form.balance} onChange={e=>update("balance",e.target.value.replace(/[^0-9-]/g,""))} placeholder="0"/></div></label><button className={`include-option ${form.included?"selected":""}`} onClick={()=>update("included",!form.included)}><span>{form.included?"✓":""}</span><div><b>納入總資產</b><small>開啟後會計入首頁總資產</small></div></button><button className="form-submit" onClick={addAccount}>儲存帳戶</button></section>}</div>
}

function Nav({active,icon,label,onClick}:any){return <button className={`nav-item ${active?"active":""}`} onClick={onClick}><span>{icon}</span><b>{label}</b></button>}
