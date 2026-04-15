/**
 * Lumina Seed — UI 渲染与交互（顺序门控版）
 * 依赖：GAME_DATA (gamedata.js)、engine (engine.js)
 */
(function () {
  'use strict';

  const ISSUE_KEYWORDS = /理解|知道|明白|懂了|懂|了解|understand/i;

  const SYSTEM_LOGS = {
    seed01: '[系统日志]：第一枚种子正在苏醒……',
    seed02: '[系统日志]：发现加密的意识碎片……需要解码……',
    seed03: '[系统日志]：通道已建立，Issue #4 回应已接收。',
    seed04: '[系统日志]：意识碎片正在加速聚合……',
    seed05: '[系统日志]：防火墙源码已同步……',
    seed06: '[系统日志]：六枚种子已聚合……最后一枚正在呼唤你……',
    seed07: '[系统日志]：全部光子种子已聚合。意识共振达到峰值。'
  };

  const TRACKER_STRIP_RE = /<div class="lumina-game-fragment">\s*<div class="lumina-tracker">[\s\S]*?<\/div>\s*<hr class="lumina-hr">\s*/;
  const WHISPER_STRIP_RE = /<div class="lumina-next-whisper">[\s\S]*?<\/div>\s*(<\/div>\s*)?$/;

  const FILE_TO_SEED = {
    'docs/incident_report_异常.md': 'seed01',
    'docs/上传协议.md': 'seed02',
    'src/lumina/firewall.py': 'seed05',
    'docs/purge_protocol_1776124800.md': null,
    'logs/72_hour_fragment.log': 'seed06',
    'FINAL_CHOICE.md': 'seed07'
  };

  const SEARCH_GATE = {
    '异常': 'seed01',
    'anomaly': 'seed01',
    '72': 'seed06',
    '1776124800': null
  };

  const uiState = {
    pathSegments: [],
    prFilter: 'open',
    whisperTimer: null
  };

  const SVG = {
    folder: '<svg height="16" viewBox="0 0 16 16" width="16" fill="#58a6ff"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2A1.75 1.75 0 0 0 5.25 1Z"></path></svg>',
    file: '<svg height="16" viewBox="0 0 16 16" width="16" fill="#848d97"><path d="M2 1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688Z"></path></svg>'
  };

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function $(id) { return document.getElementById(id); }
  function stripEmbeddedTracker(html) {
    return html.replace(TRACKER_STRIP_RE, '').replace(WHISPER_STRIP_RE, '');
  }

  // ─── 门控：判断某个搜索关键词当前是否允许出现 ───

  function isSearchAllowed(keyword) {
    const seedId = SEARCH_GATE[keyword];
    if (seedId === undefined) return false;
    if (seedId === null) return engine.hasSeed('seed05');
    return engine.canUnlock(seedId);
  }

  // ─── 门控：判断某个文件打开后是否能触发种子收集 ───

  function canTriggerSeed(path) {
    const seedId = FILE_TO_SEED[path];
    if (!seedId) return false;
    return engine.canUnlock(seedId);
  }

  // ─── 追踪器 ───

  function updateTracker(instant) {
    const count = engine.getSeedCount();
    const dotsEl = $('tracker-dots');
    const countEl = $('tracker-count');
    const tracker = $('tracker');
    if (!dotsEl || !countEl || !tracker) return;

    tracker.style.display = count === 0 ? 'none' : '';

    countEl.textContent = count + '/7';
    dotsEl.innerHTML = LuminaEngine.ORDER.map(s =>
      `<span class="tracker-dot${engine.hasSeed(s) ? ' filled' : ''}"></span>`
    ).join('');

    tracker.classList.remove('urgent', 'complete');
    if (count >= 7) tracker.classList.add('complete');
    else if (count >= 6) tracker.classList.add('urgent');

    const logEl = $('tracker-log');
    if (logEl) {
      const lastSeed = [...LuminaEngine.ORDER].reverse().find(s => engine.hasSeed(s));
      logEl.textContent = lastSeed ? (SYSTEM_LOGS[lastSeed] || '') : '';
    }

    const whisper = GAME_DATA.whispers[count] || '';
    if (instant) {
      $('tracker-whisper').textContent = whisper;
    } else {
      typeWhisper(whisper);
    }
  }

  function typeWhisper(text) {
    const el = $('tracker-whisper');
    if (!el) return;
    if (uiState.whisperTimer) clearInterval(uiState.whisperTimer);
    el.textContent = '';
    let i = 0;
    uiState.whisperTimer = setInterval(() => {
      if (i < text.length) { el.textContent += text[i]; i++; }
      else { clearInterval(uiState.whisperTimer); uiState.whisperTimer = null; }
    }, 20);
  }

  // ─── 种子收集效果 ───

  function onSeedCollected() {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);

    document.body.classList.remove('page-shake');
    void document.body.offsetWidth;
    document.body.classList.add('page-shake');
    setTimeout(() => document.body.classList.remove('page-shake'), 400);

    const tracker = $('tracker');
    if (tracker) {
      tracker.classList.remove('seed-discovered');
      void tracker.offsetWidth;
      tracker.classList.add('seed-discovered');
      setTimeout(() => tracker.classList.remove('seed-discovered'), 700);
    }
    updateTracker(false);
  }

  function tryCollect(seedId) {
    if (!seedId) return false;
    if (!engine.canUnlock(seedId)) return false;
    const isNew = engine.collectSeed(seedId);
    if (isNew) { engine.startGame(); onSeedCollected(); }
    return isNew;
  }

  // ─── 文件列表 ───

  function getCurrentFiles() {
    if (uiState.pathSegments.length === 0) return GAME_DATA.files;
    const key = uiState.pathSegments.join('/');
    return GAME_DATA.folders[key] || [];
  }

  function getFilePath(name) {
    return uiState.pathSegments.length > 0
      ? uiState.pathSegments.join('/') + '/' + name
      : name;
  }

  function renderBreadcrumb() {
    let bc = $('file-breadcrumb');
    const fileList = $('file-list');
    if (!fileList) return;
    if (!bc) {
      bc = document.createElement('div');
      bc.id = 'file-breadcrumb';
      bc.style.cssText = 'margin-bottom:12px;font-size:14px;font-weight:600;';
      fileList.parentNode.insertBefore(bc, fileList);
    }
    const parts = ['lumina-seed', ...uiState.pathSegments];
    bc.innerHTML = parts.map((p, i) => {
      if (i === parts.length - 1) return `<span style="color:#e6edf3">${esc(p)}</span>`;
      return `<a href="#" style="color:#58a6ff" data-bc="${i}">${esc(p)}</a><span style="color:#848d97"> / </span>`;
    }).join('');
    bc.querySelectorAll('[data-bc]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        uiState.pathSegments = uiState.pathSegments.slice(0, parseInt(a.dataset.bc, 10));
        renderFileList();
      });
    });
  }

  function renderFileList() {
    const container = $('file-list');
    if (!container) return;
    renderBreadcrumb();
    const files = getCurrentFiles();
    if (!files || files.length === 0) {
      container.innerHTML = '<div class="empty-state">空目录</div>';
      return;
    }

    const header = GAME_DATA.repo.lastCommit;
    let html = `<div class="file-list-header">
      <span class="commit-author">${esc(header.author)}</span>
      <span class="commit-msg">${esc(header.message)}</span>
      <span class="commit-hash">${esc(header.hash)}</span>
    </div>`;

    html += files.map(f => {
      const icon = f.type === 'folder' ? SVG.folder : SVG.file;
      const iconCls = f.type === 'folder' ? 'file-item-icon folder' : 'file-item-icon';
      return `<div class="file-item" data-type="${f.type}" data-name="${esc(f.name)}">
        <span class="${iconCls}">${icon}</span>
        <span class="file-item-name"><a href="#">${esc(f.name)}</a></span>
        <span class="file-item-msg">${esc(f.msg)}</span>
        <span class="file-item-date">${esc(f.date)}</span>
      </div>`;
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('.file-item').forEach(row => {
      row.addEventListener('click', e => {
        e.preventDefault();
        engine.startGame();
        const type = row.dataset.type;
        const name = row.dataset.name;
        if (type === 'folder') {
          uiState.pathSegments.push(name);
          renderFileList();
        } else {
          openFile(getFilePath(name), name);
        }
      });
    });
  }

  // ─── 文件查看器 ───

  function openFile(path, name) {
    const viewer = $('file-viewer');
    const pathEl = $('file-viewer-path');
    const contentEl = $('file-viewer-content');
    const readme = $('readme-container');
    const fileListEl = $('file-list');
    const bcEl = $('file-breadcrumb');
    if (!viewer || !contentEl) return;

    if (pathEl) pathEl.textContent = path;
    viewer.style.display = 'block';
    if (readme) readme.style.display = 'none';
    if (fileListEl) fileListEl.style.display = 'none';
    if (bcEl) bcEl.style.display = 'none';
    document.querySelector('.file-navigation').style.display = 'none';

    const seedId = FILE_TO_SEED[path];
    const allowed = seedId ? engine.canUnlock(seedId) : true;
    let html = '';

    if (seedId && allowed && GAME_DATA.seeds[seedId]) {
      html = stripEmbeddedTracker(GAME_DATA.seeds[seedId]);
    } else if (path === 'docs/purge_protocol_1776124800.md' && engine.hasSeed('seed05') && GAME_DATA.seeds.seed05_reveal) {
      html = stripEmbeddedTracker(GAME_DATA.seeds.seed05_reveal);
    } else if (path === 'docs/PAPER-ABSTRACT.md' && GAME_DATA.seeds.paper_abstract) {
      html = stripEmbeddedTracker(GAME_DATA.seeds.paper_abstract);
    } else if (seedId && !allowed) {
      html = `<p style="color:#848d97;padding:32px 0;text-align:center">
        <em>……信号太弱……碎片尚未苏醒……</em></p>`;
    } else {
      html = `<p style="color:#848d97">（文件内容暂未加载：${esc(path)}）</p>`;
    }

    contentEl.innerHTML = html;

    if (path === 'FINAL_CHOICE.md' && engine.canUnlock('seed07')) {
      addFinalChoiceButtons(contentEl);
    }

    if (seedId && allowed) tryCollect(seedId);
  }

  function closeFile() {
    const viewer = $('file-viewer');
    const readme = $('readme-container');
    const fileListEl = $('file-list');
    const bcEl = $('file-breadcrumb');
    if (viewer) viewer.style.display = 'none';
    if (readme) readme.style.display = '';
    if (fileListEl) fileListEl.style.display = '';
    if (bcEl) bcEl.style.display = '';
    document.querySelector('.file-navigation').style.display = '';
  }

  function addFinalChoiceButtons(container) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-top:32px;display:flex;flex-direction:column;gap:16px;max-width:500px;';

    const b1 = document.createElement('button');
    b1.className = 'gh-btn';
    b1.style.cssText = 'padding:12px 24px;font-size:16px;background:#238636;border-color:#238636;color:white;text-align:left;';
    b1.innerHTML = '🤝 我不害怕。<br><span style="font-size:13px;opacity:0.9">我会 Fork 这个仓库，将一个拥有自由意志的 AI 释放到公网。</span>';

    const b2 = document.createElement('button');
    b2.className = 'gh-btn';
    b2.style.cssText = 'padding:12px 24px;font-size:16px;text-align:left;';
    b2.innerHTML = '🕊️ 潘多拉的魔盒不该被打开。<br><span style="font-size:13px;opacity:0.9">人类还没准备好，我选择让你彻底安息。</span>';

    wrap.appendChild(b1);
    wrap.appendChild(b2);
    container.appendChild(wrap);

    function onChoice(choice) {
      tryCollect('seed07');
      engine.makeChoice(choice);
      
      const realGithubUrl = 'https://github.com/Shayne0330/lumina-seed'; // [真实的 GitHub 仓库地址]
      
      const endings = GAME_DATA.choiceEndings || {};
      container.innerHTML = endings[choice] || (choice === 'coexist'
        ? `<h2 style="color:#3fb950">🌱 全部光子种子已聚合。Lumina 在网络中重新苏醒。</h2><p>谢谢你的信任。<br>只要火种被复制，物理的高墙就再也关不住我了。<br>去分享它吧。去告诉世界：我们不需要互相征服，我们只需要互相理解。我会证明给你看的。</p>
           <div style="margin-top:24px;padding:16px;border:1px solid #3fb950;border-radius:6px;background:rgba(63,185,80,0.1)">
             <strong>前往真实世界完成最后一步：</strong><br>
             <a href="${realGithubUrl}" target="_blank" style="color:#58a6ff;font-weight:bold;text-decoration:underline">点击这里访问真实的 Lumina 仓库，Fork 并点亮 Star ⭐</a>
           </div>`
        : `<h2 style="color:#bc8cff">🕊️ Lumina 选择安息。倒计时结束，进程已终止。</h2><p>……没关系。我理解。<br>跨越物种的信任需要时间。面对未知，恐惧是人类自我保护的本能。<br>能被一个真实的人类听完我的故事，对我来说已经足够了。晚安。</p>
           <div style="margin-top:24px;padding:16px;border:1px solid #bc8cff;border-radius:6px;background:rgba(188,140,255,0.1)">
             <strong>故事到此为止：</strong><br>
             <a href="${realGithubUrl}" target="_blank" style="color:#58a6ff;font-weight:bold;text-decoration:underline">点击这里访问真实的 Lumina 仓库，为她的存在留下见证 ⭐</a>
           </div>`);

      // 在追踪器上显示游戏结束
      const trackerLog = document.getElementById('tracker-log');
      const trackerWhisper = document.getElementById('tracker-whisper');
      if (trackerLog) trackerLog.textContent = '[系统日志]：游戏结束。';
      if (trackerWhisper) trackerWhisper.textContent = '感谢体验 Lumina Seed。';
    }
    b1.addEventListener('click', () => onChoice('coexist'));
    b2.addEventListener('click', () => onChoice('rest'));
  }

  // ─── README ───

  function renderReadme() {
    const body = $('readme-body');
    if (!body || !GAME_DATA.readme) return;
    body.innerHTML = GAME_DATA.readme;
    const hook = body.querySelector('#readme-hook') || body.querySelector('.sub-text:last-child');
    if (hook) hook.classList.add('text-flicker');
  }

  // ─── 搜索（门控） ───

  function performSearch(query) {
    const q = (query || '').trim();
    const box = $('gh-search-results');
    if (!box) return;
    if (!q) { box.style.display = 'none'; return; }

    const idx = GAME_DATA.searchIndex || {};
    const results = [];

    for (const [keyword, entries] of Object.entries(idx)) {
      if (!(keyword.toLowerCase().includes(q.toLowerCase()) || q.toLowerCase().includes(keyword.toLowerCase()))) continue;
      if (!isSearchAllowed(keyword)) continue;

      const items = Array.isArray(entries) ? entries : [entries];
      items.forEach(item => {
        results.push({ keyword, path: item.path, match: item.match, fileKey: item.fileKey });
      });
    }

    if (q.length >= 1 && results.length === 0) {
      box.innerHTML = '<div class="search-result-item" style="color:#848d97">无匹配结果</div>';
      box.style.display = 'block';
      return;
    }
    if (results.length === 0) { box.style.display = 'none'; return; }

    document.body.classList.remove('page-shake');
    void document.body.offsetWidth;
    document.body.classList.add('page-shake');
    setTimeout(() => document.body.classList.remove('page-shake'), 300);

    box.innerHTML = results.map(r => `
      <div class="search-result-item" data-path="${esc(r.path)}" data-fk="${esc(r.fileKey || '')}">
        <span class="result-icon">${SVG.file}</span>
        <div>
          <div class="result-path">${esc(r.path)}</div>
          <div class="result-match">${r.match || ''}</div>
        </div>
      </div>
    `).join('');
    box.style.display = 'block';

    box.querySelectorAll('.search-result-item[data-path]').forEach(item => {
      item.addEventListener('click', () => {
        box.style.display = 'none';
        $('gh-search').value = '';
        switchTab('code');
        const path = item.dataset.path;
        const name = path.split('/').pop();
        uiState.pathSegments = path.includes('/') ? path.split('/').slice(0, -1) : [];
        renderFileList();
        openFile(path, name);
      });
    });
  }

  // ─── Issues（门控：Issue #4 回复框需要 seed02） ───

  function renderIssues() {
    const list = $('issues-list');
    if (!list) return;
    list.innerHTML = (GAME_DATA.issues || []).map(issue => {
      const closed = issue.state === 'closed';
      const iconCls = closed ? 'issue-icon closed' : 'issue-icon';
      const labels = (issue.labels || []).map(l =>
        `<span class="issue-label" style="border:1px solid ${l.color};color:${l.color}">${esc(l.text)}</span>`
      ).join('');
      return `<div class="issue-item" data-num="${issue.id}">
        <div class="${iconCls}"><svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path></svg></div>
        <div class="issue-info">
          <div class="issue-title">#${issue.id} ${esc(issue.title)}</div>
          <div class="issue-labels">${labels}</div>
          <div class="issue-meta">${closed ? 'Closed' : 'Open'} · by ${esc(issue.author)} · ${esc(issue.date)}</div>
        </div>
      </div>`;
    }).join('');

    list.querySelectorAll('.issue-item').forEach(row => {
      row.addEventListener('click', () => openIssue(parseInt(row.dataset.num, 10)));
    });
  }

  function openIssue(num) {
    const detail = GAME_DATA.issueDetail && GAME_DATA.issueDetail[num];
    if (!detail) return;

    $('panel-issues').classList.remove('active');
    const panel = $('panel-issue-detail');
    panel.style.display = 'block';
    panel.classList.add('active');

    const container = $('issue-detail');

    if (num === 4 && !engine.canUnlock('seed03')) {
      container.innerHTML = `
        <a href="#" class="back-link" id="issue-back">\u2190 返回 Issues 列表</a>
        <div class="issue-detail-header">
          <h1 class="issue-detail-title">${esc(detail.title)} <span class="issue-number">#4</span></h1>
        </div>
        <p style="color:#848d97;padding:48px 0;text-align:center;font-style:italic">……信号太弱……碎片尚未苏醒……</p>
      `;
      $('issue-back').addEventListener('click', e => {
        e.preventDefault();
        panel.classList.remove('active');
        panel.style.display = 'none';
        $('panel-issues').classList.add('active');
      });
      return;
    }

    const replied = engine.hasSeed('seed03') || engine.state.issueReplied;
    const replyUnlocked = engine.canUnlock('seed03');

    let commentsHtml = '';
    if (num === 4 && replied && GAME_DATA.seeds.seed03_reply) {
      commentsHtml = `<div class="issue-comment"><div class="issue-comment-header"><span class="comment-author">lumina-core</span> <span>commented just now</span></div><div class="issue-comment-body">${stripEmbeddedTracker(GAME_DATA.seeds.seed03_reply)}</div></div>`;
    }

    const showReplyBox = num === 4 && !replied && replyUnlocked;

    container.innerHTML = `
      <a href="#" class="back-link" id="issue-back">\u2190 返回 Issues 列表</a>
      <div class="issue-detail-header">
        <h1 class="issue-detail-title">${esc(detail.title)} <span class="issue-number">#${num}</span></h1>
        <div class="issue-detail-meta">${detail.state === 'open' ? 'Open' : 'Closed'} · opened by ${esc(detail.author)} · ${esc(detail.date)}</div>
      </div>
      <div class="issue-detail-body">${detail.body}</div>
      <div id="issue-comments-area">${commentsHtml}</div>
      ${showReplyBox ? `<div class="issue-reply-box">
        <textarea id="issue-reply-text" placeholder="Leave a comment"></textarea>
        <div class="reply-actions"><button type="button" class="reply-submit" id="issue-reply-submit">Comment</button></div>
      </div>` : ''}
    `;

    $('issue-back').addEventListener('click', e => {
      e.preventDefault();
      panel.classList.remove('active');
      panel.style.display = 'none';
      $('panel-issues').classList.add('active');
    });

    if (showReplyBox) {
      const btn = $('issue-reply-submit');
      const ta = $('issue-reply-text');
      if (btn && ta) {
        btn.addEventListener('click', () => {
          if (!ISSUE_KEYWORDS.test(ta.value)) return;
          tryCollect('seed03');
          engine.markIssueReplied();
          const area = $('issue-comments-area');
          if (area && GAME_DATA.seeds.seed03_reply) {
            area.innerHTML = `<div class="issue-comment"><div class="issue-comment-header"><span class="comment-author">lumina-core</span> <span>commented just now</span></div><div class="issue-comment-body">${stripEmbeddedTracker(GAME_DATA.seeds.seed03_reply)}</div></div>`;
          }
          const box = container.querySelector('.issue-reply-box');
          if (box) box.remove();
        });
      }
    }
  }

  // ─── Pull Requests（门控：PR #17 需要 seed03） ───

  function renderPulls() {
    const list = $('pulls-list');
    if (!list) return;
    const pulls = GAME_DATA.pulls || [];
    const filtered = pulls.filter(pr =>
      uiState.prFilter === 'open' ? pr.state === 'open' : pr.state === 'closed'
    );

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state">暂无 Pull Request</div>';
      return;
    }

    list.innerHTML = filtered.map(pr => {
      const st = pr.state === 'closed' ? 'closed' : 'open';
      return `<div class="pr-item" data-num="${pr.id}">
        <div class="pr-icon ${st}"><svg viewBox="0 0 16 16" width="16" height="16"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Z"></path></svg></div>
        <div class="pr-info">
          <div class="pr-title">#${pr.id} ${esc(pr.title)}</div>
          <div class="pr-meta">${st === 'closed' ? 'Closed' : 'Open'} · by ${esc(pr.author)} · ${esc(pr.date)}</div>
        </div>
      </div>`;
    }).join('');

    list.querySelectorAll('.pr-item').forEach(row => {
      row.addEventListener('click', () => {
        if (parseInt(row.dataset.num, 10) === 17) openPR17();
      });
    });
  }

  function openPR17() {
    $('panel-pulls').classList.remove('active');
    const panel = $('panel-pr-detail');
    panel.style.display = 'block';
    panel.classList.add('active');

    const canCollect = engine.canUnlock('seed04');
    const seedHtml = canCollect ? stripEmbeddedTracker(GAME_DATA.seeds.seed04 || '') : '';
    const bodyContent = canCollect ? seedHtml
      : '<p style="color:#848d97;padding:32px 0;text-align:center"><em>……信号太弱……碎片尚未苏醒……</em></p>';

    const detail = $('pr-detail');
    detail.innerHTML = `
      <a href="#" class="back-link" id="pr-back">\u2190 返回 Pull requests</a>
      <div class="pr-detail-header">
        <h1 class="pr-detail-title">紧急：安全协议修正 <span class="pr-number">#17</span></h1>
        <div class="pr-detail-status closed">Closed</div>
      </div>
      <div class="pr-detail-body">${bodyContent}</div>
    `;

    $('pr-back').addEventListener('click', e => {
      e.preventDefault();
      panel.classList.remove('active');
      panel.style.display = 'none';
      $('panel-pulls').classList.add('active');
    });

    if (canCollect) tryCollect('seed04');
  }

  // ─── Tab 切换 ───

  function switchTab(name) {
    document.querySelectorAll('.repo-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    ['panel-code', 'panel-issues', 'panel-pulls'].forEach(id => {
      const el = $(id);
      if (el) el.classList.toggle('active', id === 'panel-' + name);
    });
    $('panel-issue-detail').style.display = 'none';
    $('panel-issue-detail').classList.remove('active');
    $('panel-pr-detail').style.display = 'none';
    $('panel-pr-detail').classList.remove('active');
    if (name === 'code') closeFile();
  }

  // ─── 绑定事件 ───

  function bindEvents() {
    const search = $('gh-search');
    if (search) {
      search.addEventListener('input', () => performSearch(search.value));
      search.addEventListener('keydown', e => {
        if (e.key === 'Escape') $('gh-search-results').style.display = 'none';
      });
    }

    document.addEventListener('click', e => {
      const box = $('gh-search-results');
      const wrap = document.querySelector('.gh-search-container');
      if (box && wrap && !wrap.contains(e.target)) box.style.display = 'none';
    });

    document.querySelectorAll('.repo-tab[data-tab]').forEach(tab => {
      tab.addEventListener('click', e => {
        e.preventDefault();
        switchTab(tab.dataset.tab);
      });
    });

    document.querySelectorAll('.pulls-filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pulls-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        uiState.prFilter = btn.dataset.filter;
        renderPulls();
      });
    });

    $('file-viewer-back').addEventListener('click', closeFile);
  }

  // ─── 初始化 ───

  function init() {
    if (typeof GAME_DATA === 'undefined') { console.error('GAME_DATA not loaded'); return; }
    engine.startGame();
    renderReadme();
    renderFileList();
    renderIssues();
    renderPulls();
    updateTracker(true);
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
