export const DASHBOARD_HTML = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>星辰数据舱｜那一片数据星辰</title>
    <link rel="stylesheet" href="/dashboard.css" />
    <script defer src="/dashboard.js"></script>
  </head>
  <body>
    <main>
      <section class="auth-shell" id="auth-shell" hidden>
        <div class="auth-card">
          <div class="brand-mark" aria-hidden="true">✦</div>
          <p class="eyebrow">PRIVATE ANALYTICS CONSOLE</p>
          <h1>进入星辰数据舱</h1>
          <p>这里只展示匿名汇总数据。请使用管理访问令牌授权当前设备。</p>
          <form id="auth-form">
            <label for="token-input">访问令牌</label>
            <input id="token-input" name="token" type="password" autocomplete="current-password" required />
            <button type="submit">授权当前设备</button>
          </form>
          <p class="auth-error" id="auth-error" role="alert"></p>
        </div>
      </section>

      <section class="dashboard" id="dashboard" hidden>
        <header class="topbar">
          <div class="brand">
            <span class="brand-mark" aria-hidden="true">✦</span>
            <div><strong>那一片数据星辰</strong><small>THE DATA GALAXY</small></div>
          </div>
          <div class="console-state"><i aria-hidden="true"></i><span>匿名数据已连接</span></div>
        </header>

        <div class="page-head">
          <div>
            <p class="eyebrow">PRIVATE ANALYTICS CONSOLE</p>
            <h1>星辰数据舱</h1>
            <p>看见哪些内容正在把访问者带向真正的行动。</p>
          </div>
          <div class="toolbar">
            <label for="range-select">统计周期</label>
            <select id="range-select">
              <option value="7">近 7 天</option>
              <option value="30" selected>近 30 天</option>
              <option value="90">近 90 天</option>
            </select>
            <button class="refresh" id="refresh-button" type="button">刷新数据</button>
          </div>
        </div>

        <div class="notice" id="empty-notice" hidden>
          <span aria-hidden="true">✦</span>
          <div><strong>统计刚刚启动</strong><p>第一次真实访问后，这里会自动出现趋势和 Skill 排名。</p></div>
        </div>

        <section class="metrics" aria-label="核心数据">
          <article><span>PAGE VIEWS</span><strong id="metric-pv">0</strong><small>页面浏览</small></article>
          <article><span>SESSIONS</span><strong id="metric-sessions">0</strong><small>匿名会话</small></article>
          <article><span>SKILL ACTIONS</span><strong id="metric-skill-clicks">0</strong><small>Skill 行动</small></article>
          <article class="gold"><span>DOWNLOAD STARTS</span><strong id="metric-downloads">0</strong><small>发起下载</small></article>
        </section>

        <section class="panel trend-panel">
          <div class="panel-head"><div><span>VISIT TREND</span><h2>访问趋势</h2></div><p id="updated-at" aria-live="polite">正在读取…</p></div>
          <div class="legend"><span><i class="pv"></i>PV</span><span><i class="click"></i>Skill 行动</span></div>
          <div class="chart" id="trend-chart" role="img" aria-label="每日页面浏览和 Skill 行动趋势"></div>
        </section>

        <section class="data-grid">
          <article class="panel skill-panel">
            <div class="panel-head"><div><span>ACTION MAP</span><h2>Skill 行动排名</h2></div><small>点击口径</small></div>
            <div class="table-wrap"><table><thead><tr><th>Skill</th><th>行动</th><th>点击</th><th>会话</th></tr></thead><tbody id="skills-body"></tbody></table></div>
          </article>

          <article class="panel page-panel">
            <div class="panel-head"><div><span>CONTENT MAP</span><h2>页面表现</h2></div><small>PV / 会话</small></div>
            <div class="table-wrap"><table><thead><tr><th>页面</th><th>PV</th><th>会话</th></tr></thead><tbody id="pages-body"></tbody></table></div>
          </article>

          <article class="panel source-panel">
            <div class="panel-head"><div><span>ACQUISITION</span><h2>访问来源</h2></div><small>匿名会话</small></div>
            <div class="source-list" id="sources-list"></div>
          </article>
        </section>

        <footer>
          <p>只展示匿名汇总数据；不收集姓名、联系方式或完整 IP。下载数代表“发起下载”，不代表文件完整下载。</p>
          <button id="forget-device" type="button">取消当前设备授权</button>
        </footer>
      </section>
    </main>
  </body>
</html>`;

export const DASHBOARD_CSS = `
:root{--ink:#0d1820;--navy:#102734;--deep:#08151d;--paper:#f3efe5;--cream:#fbf8f0;--gold:#c99a49;--gold-soft:#e8d1a2;--line:rgba(16,39,52,.14);--muted:#6f797c;--green:#5f9e83;--white:#fff;--shadow:0 24px 80px rgba(8,21,29,.12)}
*{box-sizing:border-box}
html{background:var(--paper);color:var(--ink);font-family:"Songti SC","Noto Serif SC",Georgia,serif}
body{margin:0;min-height:100vh;background:radial-gradient(circle at 90% 0,rgba(201,154,73,.12),transparent 28rem),linear-gradient(180deg,#f8f4ea 0,#efeadd 100%)}
button,select,input{font:inherit}
button{cursor:pointer}
[hidden]{display:none!important}
.auth-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--deep);color:var(--cream);position:relative;overflow:hidden}
.auth-shell:before,.auth-shell:after{content:"";position:absolute;border:1px solid rgba(201,154,73,.24);border-radius:50%;width:38rem;height:38rem;right:-18rem;top:-18rem}
.auth-shell:after{width:22rem;height:22rem;left:-12rem;top:auto;bottom:-10rem}
.auth-card{width:min(100%,500px);border:1px solid rgba(232,209,162,.24);padding:48px;background:rgba(16,39,52,.72);box-shadow:0 40px 120px rgba(0,0,0,.28);position:relative;z-index:1}
.brand-mark{color:var(--gold);font-size:30px;line-height:1}
.eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.19em;text-transform:uppercase;color:var(--gold);margin:20px 0 12px}
.auth-card h1{font-size:38px;font-weight:500;margin:0 0 16px}.auth-card>p:not(.eyebrow):not(.auth-error){color:#c5cfce;line-height:1.8}
.auth-card form{display:grid;gap:10px;margin-top:28px}.auth-card label{font-size:13px;color:var(--gold-soft)}
.auth-card input{height:50px;border:1px solid rgba(232,209,162,.35);background:#071219;color:white;padding:0 14px;outline:none}.auth-card input:focus{border-color:var(--gold)}
.auth-card button{height:50px;border:0;background:var(--gold);color:var(--deep);font-weight:700;margin-top:8px}.auth-error{min-height:22px;color:#efb1a8;font-size:13px}
.dashboard{width:min(1440px,100%);margin:0 auto;min-height:100vh;padding:0 44px 40px}
.topbar{min-height:76px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:14px}.brand strong{display:block;font-size:16px;font-weight:600}.brand small{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;letter-spacing:.18em;color:var(--muted)}
.console-state{display:flex;align-items:center;gap:9px;color:var(--muted);font-size:12px}.console-state i{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(95,158,131,.12)}
.page-head{display:flex;align-items:end;justify-content:space-between;gap:32px;padding:54px 0 32px}.page-head h1{font-size:clamp(42px,6vw,76px);font-weight:500;letter-spacing:-.045em;margin:0 0 12px}.page-head>div>p:last-child{margin:0;color:var(--muted);font-size:16px}
.toolbar{display:grid;grid-template-columns:auto auto auto;align-items:center;gap:10px}.toolbar label{font-size:12px;color:var(--muted)}.toolbar select,.toolbar button{height:42px;border:1px solid var(--line);background:rgba(255,255,255,.48);padding:0 14px;color:var(--ink)}.toolbar button{background:var(--navy);color:white;border-color:var(--navy)}
.notice{display:flex;gap:16px;align-items:center;border:1px solid rgba(201,154,73,.35);background:rgba(232,209,162,.2);padding:18px 22px;margin-bottom:18px}.notice>span{font-size:24px;color:var(--gold)}.notice strong{font-size:15px}.notice p{margin:4px 0 0;color:var(--muted);font-size:13px}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);background:rgba(255,255,255,.32);margin-bottom:18px}.metrics article{min-height:168px;padding:24px 26px;border-right:1px solid var(--line);display:flex;flex-direction:column}.metrics article:last-child{border-right:0}.metrics span,.panel-head span{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.15em;color:var(--muted)}.metrics strong{font-size:56px;font-weight:500;line-height:1;margin:auto 0 12px;letter-spacing:-.05em}.metrics small{color:var(--muted)}.metrics .gold{background:var(--navy);color:var(--cream)}.metrics .gold span,.metrics .gold small{color:var(--gold-soft)}
.panel{background:rgba(255,255,255,.48);border:1px solid var(--line);box-shadow:0 10px 40px rgba(8,21,29,.035)}.panel-head{display:flex;justify-content:space-between;align-items:start;padding:24px 26px;border-bottom:1px solid var(--line)}.panel-head h2{font-size:23px;font-weight:500;margin:7px 0 0}.panel-head p,.panel-head small{margin:3px 0 0;color:var(--muted);font-size:12px}
.trend-panel{margin-bottom:18px}.legend{display:flex;gap:22px;padding:17px 26px 0;color:var(--muted);font-size:12px}.legend span{display:flex;align-items:center;gap:7px}.legend i{width:9px;height:9px;border-radius:50%;display:block}.legend .pv{background:var(--navy)}.legend .click{background:var(--gold)}
.chart{height:260px;padding:26px;display:flex;align-items:stretch;gap:4px;overflow:hidden}.chart-day{flex:1;min-width:4px;display:grid;grid-template-rows:1fr 22px;gap:8px;position:relative}.chart-bars{display:flex;align-items:end;justify-content:center;gap:2px;border-bottom:1px solid var(--line)}.chart-bar{width:min(12px,42%);min-height:0;border-radius:2px 2px 0 0;transition:height .25s ease}.chart-bar.pv{background:var(--navy)}.chart-bar.click{background:var(--gold)}.chart-label{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;color:var(--muted);text-align:center;white-space:nowrap}.chart-empty{margin:auto;text-align:center;color:var(--muted);line-height:1.8}
.data-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:18px}.skill-panel{grid-row:span 2}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:15px 26px;border-bottom:1px solid var(--line)}th{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;letter-spacing:.12em;color:var(--muted);font-weight:500}td:nth-last-child(-n+2),th:nth-last-child(-n+2){text-align:right;font-variant-numeric:tabular-nums}.empty-row td{text-align:center!important;color:var(--muted);padding:48px 24px}
.source-list{padding:6px 26px 20px}.source-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:14px 0;border-bottom:1px solid var(--line)}.source-item:last-child{border-bottom:0}.source-item strong{font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.source-item span{font-variant-numeric:tabular-nums;color:var(--gold);font-weight:700}.source-item small{grid-column:1/-1;color:var(--muted);font-size:10px}.source-empty{padding:44px 0;text-align:center;color:var(--muted);font-size:13px}
footer{display:flex;justify-content:space-between;align-items:center;gap:28px;margin-top:24px;padding-top:22px;border-top:1px solid var(--line);color:var(--muted);font-size:11px;line-height:1.6}footer p{max-width:820px;margin:0}footer button{border:0;background:none;color:var(--muted);text-decoration:underline;text-underline-offset:4px;white-space:nowrap}
@media(max-width:900px){.dashboard{padding:0 20px 30px}.page-head{align-items:start;flex-direction:column}.metrics{grid-template-columns:repeat(2,1fr)}.metrics article:nth-child(2){border-right:0}.metrics article:nth-child(-n+2){border-bottom:1px solid var(--line)}.data-grid{grid-template-columns:1fr}.skill-panel{grid-row:auto}.chart{height:230px;padding:20px 12px}.panel-head{padding:20px}.table-wrap th,.table-wrap td{padding:14px 20px}}
@media(max-width:560px){.topbar{min-height:66px}.console-state span{display:none}.page-head{padding:38px 0 24px}.toolbar{width:100%;grid-template-columns:1fr 1fr}.toolbar label{grid-column:1/-1}.toolbar select,.toolbar button{width:100%}.metrics{grid-template-columns:1fr 1fr}.metrics article{min-height:140px;padding:18px}.metrics strong{font-size:42px}.auth-card{padding:34px 24px}.auth-card h1{font-size:31px}.chart{gap:2px}.chart-label{display:none}footer{align-items:start;flex-direction:column}}
`;

export const DASHBOARD_JS = `
(function(){
  "use strict";
  var TOKEN_KEY="dg_dashboard_token";
  var token="";
  var state={days:30};
  var skillNames={
    "dpa-review":"DPA 协议审核",
    "contract-review":"合同审核 Starter",
    "news-podcast-generator":"新闻播客生成",
    "child-reading-adventures":"儿童阅读冒险设计",
    "edpb-anonymisation-guidelines":"EDPB 匿名化指南",
    "privacy-policy-generator":"MVP 隐私协议生成器",
    "gutachten-civil-case":"鉴定式民法案例研习",
    "overseas-data-compliance-research":"出海数据合规调研",
    "ai-litigation-compass":"AI 诉讼风向标建设罗盘"
  };
  var actionNames={download_zip:"下载 ZIP",download_skill:"下载 .skill",github:"查看 GitHub",source:"前往来源",use:"前往使用",review_article:"测评报告"};
  var pageNames={"/the-data-galaxy-site/":"首页","/the-data-galaxy-site/index.html":"首页","/the-data-galaxy-site/skills.html":"Skill 资料库","/the-data-galaxy-site/ai-litigation-compass-report.html":"AI 诉讼风向标报告"};

  function byId(id){return document.getElementById(id)}
  function number(value){return new Intl.NumberFormat("zh-CN").format(Number(value)||0)}
  function textCell(value){var td=document.createElement("td");td.textContent=value;return td}
  function emptyRow(tbody,columns,message){var tr=document.createElement("tr");tr.className="empty-row";var td=textCell(message);td.colSpan=columns;tr.appendChild(td);tbody.replaceChildren(tr)}

  function readBootstrapToken(){
    var params=new URLSearchParams(location.hash.slice(1));
    var incoming=params.get("access_token");
    if(incoming){localStorage.setItem(TOKEN_KEY,incoming);history.replaceState(null,"",location.pathname)}
    return incoming||localStorage.getItem(TOKEN_KEY)||"";
  }

  function showAuth(message){byId("dashboard").hidden=true;byId("auth-shell").hidden=false;byId("auth-error").textContent=message||"";byId("token-input").focus()}
  function showDashboard(){byId("auth-shell").hidden=true;byId("dashboard").hidden=false}

  async function load(){
    if(!token){showAuth();return}
    byId("updated-at").textContent="正在读取…";
    byId("refresh-button").disabled=true;
    try{
      var response=await fetch("/v1/stats?days="+state.days,{headers:{Authorization:"Bearer "+token},cache:"no-store"});
      if(response.status===401){localStorage.removeItem(TOKEN_KEY);token="";showAuth("访问令牌无效或已失效。");return}
      if(!response.ok)throw new Error("stats_unavailable");
      var data=await response.json();
      showDashboard();render(data);
    }catch(_error){showDashboard();byId("updated-at").textContent="暂时无法读取，请稍后重试"}
    finally{byId("refresh-button").disabled=false}
  }

  function render(data){
    var summary=data.summary||{};
    byId("metric-pv").textContent=number(summary.page_views);
    byId("metric-sessions").textContent=number(summary.sessions);
    byId("metric-skill-clicks").textContent=number(summary.skill_clicks);
    byId("metric-downloads").textContent=number(summary.download_starts);
    byId("empty-notice").hidden=Number(summary.total_events||0)>0;
    byId("updated-at").textContent="更新于 "+new Date(data.generated_at).toLocaleString("zh-CN",{hour12:false});
    renderTrend(data.daily||[]);renderSkills(data.skills||[]);renderPages(data.pages||[]);renderSources(data.sources||[])
  }

  function renderTrend(items){
    var chart=byId("trend-chart");chart.replaceChildren();
    var max=Math.max(0,...items.map(function(item){return Math.max(Number(item.page_views)||0,Number(item.skill_clicks)||0)}));
    if(!items.length||max===0){var empty=document.createElement("p");empty.className="chart-empty";empty.textContent="有真实访问后，这里会出现每日趋势。";chart.appendChild(empty);return}
    var labelStep=items.length>45?10:items.length>14?5:1;
    items.forEach(function(item,index){
      var day=document.createElement("div");day.className="chart-day";
      var bars=document.createElement("div");bars.className="chart-bars";
      var pv=document.createElement("span");pv.className="chart-bar pv";pv.style.height=((Number(item.page_views)||0)/max*100)+"%";
      var click=document.createElement("span");click.className="chart-bar click";click.style.height=((Number(item.skill_clicks)||0)/max*100)+"%";
      bars.append(pv,click);day.appendChild(bars);
      var label=document.createElement("span");label.className="chart-label";label.textContent=index%labelStep===0?String(item.date).slice(5):"";day.appendChild(label);
      day.title=item.date+" · PV "+number(item.page_views)+" · Skill 行动 "+number(item.skill_clicks);chart.appendChild(day)
    })
  }

  function renderSkills(items){
    var body=byId("skills-body");body.replaceChildren();
    if(!items.length){emptyRow(body,4,"尚无 Skill 行动");return}
    items.forEach(function(item){var tr=document.createElement("tr");tr.append(textCell(skillNames[item.object_id]||item.object_id||"未知 Skill"),textCell(actionNames[item.action]||item.action||"其他"),textCell(number(item.clicks)),textCell(number(item.sessions)));body.appendChild(tr)})
  }

  function renderPages(items){
    var body=byId("pages-body");body.replaceChildren();
    if(!items.length){emptyRow(body,3,"尚无页面访问");return}
    items.forEach(function(item){var tr=document.createElement("tr");tr.append(textCell(pageNames[item.page_path]||item.page_path),textCell(number(item.views)),textCell(number(item.sessions)));body.appendChild(tr)})
  }

  function renderSources(items){
    var list=byId("sources-list");list.replaceChildren();
    if(!items.length){var empty=document.createElement("p");empty.className="source-empty";empty.textContent="尚无来源数据";list.appendChild(empty);return}
    items.forEach(function(item){var row=document.createElement("div");row.className="source-item";var name=document.createElement("strong");name.textContent=item.source==="direct"?"直接访问":item.source;var value=document.createElement("span");value.textContent=number(item.sessions);var note=document.createElement("small");note.textContent=Number(item.sessions)===1?"1 个匿名会话":number(item.sessions)+" 个匿名会话";row.append(name,value,note);list.appendChild(row)})
  }

  byId("auth-form").addEventListener("submit",function(event){event.preventDefault();token=byId("token-input").value.trim();if(!token)return;localStorage.setItem(TOKEN_KEY,token);load()});
  byId("range-select").addEventListener("change",function(event){state.days=Number(event.target.value)||30;load()});
  byId("refresh-button").addEventListener("click",load);
  byId("forget-device").addEventListener("click",function(){localStorage.removeItem(TOKEN_KEY);token="";showAuth("当前设备授权已取消。")});
  token=readBootstrapToken();load();
})();
`;
