 // ════════════════════════════════════════
    //  CONFIGURAÇÃO — edite aqui antes de enviar ao cliente
    // ════════════════════════════════════════
    var CFG = {
      trialDias: 30,                          // duração do teste gratuito em dias
      whatsapp: '5548988563095',              // seu número com DDI+DDD sem espaços
      mensagemWpp: 'Olá! Quero continuar usando o sistema Boutique do Queijo. Podemos conversar sobre a assinatura?',
      nomeCliente: 'Boutique do Queijo'       // nome que aparece na tela de bloqueio
    };
    // ════════════════════════════════════════

    // ── DADOS EMBUTIDOS (não edite manualmente) ──
    var DB = {
      produtos: [],
      vendas: [],
      estoque: [],
      compras: [],
      trialInicio: null
    };
    // ── FIM DOS DADOS ──

    var COLORS = { Queijos: '#378ADD', Embutidos: '#1D9E75', Acompanhamentos: '#EF9F27', Outros: '#888780' };
    var PGTO_C = { 'Cartão Débito': '#378ADD', 'PIX': '#1D9E75', 'Cartão Crédito': '#EF9F27', 'Dinheiro': '#888780' };
    var charts = {};
    var editIdx = -1;

    // ── TRIAL ──
    function initTrial() {
      if (!DB.trialInicio) {
        DB.trialInicio = new Date().toISOString().split('T')[0];
      }
      var inicio = new Date(DB.trialInicio + 'T00:00:00');
      var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      var diasPassados = Math.floor((hoje - inicio) / 86400000);
      var diasRestantes = CFG.trialDias - diasPassados;

      // Monta link do WhatsApp
      var wppUrl = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(CFG.mensagemWpp);
      document.getElementById('btnContato').href = wppUrl;

      if (diasRestantes <= 0) {
        // Bloqueia
        document.getElementById('bloqueio').classList.add('show');
        document.getElementById('blkBadge').textContent = 'Teste encerrado há ' + Math.abs(diasRestantes) + ' dia(s)';
        document.getElementById('trialBanner').classList.add('hide');
        return;
      }

      // Mostra banner
      var banner = document.getElementById('trialBanner');
      var texto = document.getElementById('trialDiasTexto');
      if (diasRestantes <= 5) {
        banner.classList.add('warn');
        texto.textContent = '⚠ Apenas ' + diasRestantes + ' dia(s) restante(s) de teste gratuito!';
      } else {
        texto.textContent = diasRestantes + ' dia(s) restante(s) de teste gratuito';
      }
    }

    // ── UTILITÁRIOS ──
    function fmt(v) { return 'R$ ' + parseFloat(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function fmtQ(v, u) {
      var decimais = ['kg', 'L', 'g', 'ml'].includes(u) ? 3 : 0;
      return parseFloat(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: 3 }) + ' ' + u;
    }
    function fmtDate(s) { if (!s) return '—'; var p = s.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
    function today() { return new Date().toISOString().split('T')[0]; }
    function diasVencer(v) {
      var h = new Date(); h.setHours(0, 0, 0, 0);
      return Math.round((new Date(v + 'T00:00:00') - h) / 86400000);
    }
    function statusBadge(d) {
      if (d < 0) return '<span class="badge b-red">Vencido</span>';
      if (d <= 7) return '<span class="badge b-red">Urgente</span>';
      if (d <= 30) return '<span class="badge b-amber">Atenção</span>';
      return '<span class="badge b-green">Ok</span>';
    }
    function getProd(n) { return DB.produtos.find(function (p) { return p.nome === n; }); }
    function labelUnid(u) { var m = { kg: 'por kg', g: 'por g', un: 'por unidade', L: 'por litro', ml: 'por ml', cx: 'por caixa', pct: 'por pacote', fatia: 'por fatia' }; return m[u] || u; }

    // ── NAVEGAÇÃO ──
    function showPage(id, btn) {
      document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
      document.querySelectorAll('.ntab').forEach(function (t) { t.classList.remove('active'); });
      document.getElementById(id).classList.add('active');
      btn.classList.add('active');
      popularSelects();
      if (id === 'dash') renderDash();
    }

    // ── SELECTS DINÂMICOS ──
    function popularSelects() {
      var nomes = DB.produtos.map(function (p) { return p.nome; }).sort();
      ['vProdSel', 'eProdSel', 'cProdSel'].forEach(function (id) {
        var el = document.getElementById(id); if (!el) return;
        var val = el.value, first = el.options[0].outerHTML;
        el.innerHTML = first;
        nomes.forEach(function (n) { var o = document.createElement('option'); o.value = o.textContent = n; el.appendChild(o); });
        el.value = val;
      });
    }

    function atualizarLabelPreco() {
      var u = document.getElementById('pUnid').value;
      document.getElementById('labelPreco').textContent = 'Preço ' + labelUnid(u) + ' (R$)';
    }

    function preencherVenda() {
      var p = getProd(document.getElementById('vProdSel').value);
      if (!p) { document.getElementById('vCat').value = ''; document.getElementById('vPreco').value = ''; return; }
      document.getElementById('vCat').value = p.cat;
      document.getElementById('vPreco').value = p.preco;
      document.getElementById('vQtdLbl').textContent = 'Quantidade (' + p.unid + ')';
      document.getElementById('vPrecoLbl').textContent = 'Preço ' + labelUnid(p.unid) + ' (R$)';
      calcTotal();
    }

    function preencherEstoque() {
      var p = getProd(document.getElementById('eProdSel').value);
      if (!p) return;
      document.getElementById('eCat').value = p.cat;
      document.getElementById('eEstLbl').textContent = 'Qtd em estoque (' + p.unid + ')';
    }

    function preencherCompra() {
      var nome = document.getElementById('cProdSel').value;
      if (!nome) return;
      document.getElementById('cProd').value = nome;
      var p = getProd(nome);
      if (p) document.getElementById('cQtdLbl').textContent = 'Quantidade (' + p.unid + ')';
    }

    function calcTotal() {
      var q = parseFloat(document.getElementById('vQtd').value) || 0;
      var p = parseFloat(document.getElementById('vPreco').value) || 0;
      var t = q * p;
      document.getElementById('vTotal').value = t > 0 ? fmt(t) : '';
    }
    document.addEventListener('input', function (e) {
      if (e.target.id === 'vQtd' || e.target.id === 'vPreco') calcTotal();
    });

    // ── CRUD PRODUTOS ──
    function addProduto() {
      var n = document.getElementById('pNome').value.trim();
      if (!n) { alert('Informe o nome do produto.'); return; }
      if (DB.produtos.find(function (p) { return p.nome.toLowerCase() === n.toLowerCase(); })) { alert('Produto já cadastrado.'); return; }
      DB.produtos.push({
        nome: n, cat: document.getElementById('pCat').value,
        unid: document.getElementById('pUnid').value,
        preco: parseFloat(document.getElementById('pPreco').value) || 0,
        cod: document.getElementById('pCod').value.trim(),
        obs: document.getElementById('pObs').value.trim()
      });
      document.getElementById('pNome').value = '';
      document.getElementById('pCod').value = '';
      document.getElementById('pObs').value = '';
      document.getElementById('pPreco').value = '';
      renderProdutos(); popularSelects();
    }

    function renderProdutos() {
      var arr = DB.produtos;
      document.getElementById('prodCount').textContent = arr.length + ' produto' + (arr.length !== 1 ? 's' : '') + ' cadastrado' + (arr.length !== 1 ? 's' : '');
      document.getElementById('produtosBody').innerHTML = arr.length === 0
        ? '<tr><td colspan="7"><div class="empty"><div class="empty-i">&#127828;</div>Nenhum produto ainda.<br><small>Cadastre os produtos para usá-los nas vendas e estoque.</small></div></td></tr>'
        : arr.map(function (p, i) {
          return '<tr>'
            + '<td style="color:var(--hint)">' + String(i + 1).padStart(2, '0') + '</td>'
            + '<td title="' + p.nome + '"><strong>' + p.nome + '</strong>' + (p.obs ? '<br><small style="color:var(--hint)">' + p.obs + '</small>' : '') + '</td>'
            + '<td><span class="badge b-gray">' + p.cat + '</span></td>'
            + '<td><span class="badge b-blue">' + p.unid + '</span></td>'
            + '<td>' + fmt(p.preco) + '<span class="unid-tag">/' + p.unid + '</span></td>'
            + '<td style="color:var(--hint);font-size:12px">' + (p.cod || '—') + '</td>'
            + '<td style="display:flex;gap:4px">'
            + '<button class="btn btn-sm btn-e" onclick="editarProduto(' + i + ')" title="Editar">&#9998;</button>'
            + '<button class="btn btn-sm btn-d" onclick="delItem(\'produtos\',' + i + ')" title="Remover">&#10005;</button>'
            + '</td></tr>';
        }).join('');
    }

    function editarProduto(i) {
      editIdx = i; var p = DB.produtos[i];
      document.getElementById('mNome').value = p.nome;
      document.getElementById('mCat').value = p.cat;
      document.getElementById('mUnid').value = p.unid;
      document.getElementById('mPreco').value = p.preco;
      document.getElementById('mCod').value = p.cod || '';
      document.getElementById('modalBg').classList.add('open');
    }
    function fecharModal() { document.getElementById('modalBg').classList.remove('open'); editIdx = -1; }
    function salvarEdicao() {
      if (editIdx < 0) return;
      DB.produtos[editIdx] = {
        nome: document.getElementById('mNome').value.trim(),
        cat: document.getElementById('mCat').value,
        unid: document.getElementById('mUnid').value,
        preco: parseFloat(document.getElementById('mPreco').value) || 0,
        cod: document.getElementById('mCod').value.trim(),
        obs: DB.produtos[editIdx].obs || ''
      };
      fecharModal(); renderProdutos(); popularSelects();
    }

    // ── CRUD VENDAS ──
    function addVenda() {
      var d = document.getElementById('vData').value;
      var nome = document.getElementById('vProdSel').value;
      var q = parseFloat(document.getElementById('vQtd').value);
      var pr = parseFloat(document.getElementById('vPreco').value);
      if (!d || !nome || !q || !pr || q <= 0 || pr <= 0) { alert('Preencha data, produto, quantidade e preço.'); return; }
      var p = getProd(nome);
      DB.vendas.push({ data: d, produto: nome, cat: p ? p.cat : '', unid: p ? p.unid : 'un', qtd: q, preco: pr, total: +(q * pr).toFixed(2), pgto: document.getElementById('vPgto').value, obs: document.getElementById('vObs').value.trim() });
      document.getElementById('vQtd').value = '';
      document.getElementById('vTotal').value = '';
      document.getElementById('vObs').value = '';
      document.getElementById('vMsg').textContent = '✓ Venda registrada!';
      setTimeout(function () { document.getElementById('vMsg').textContent = ''; }, 2000);
      renderVendas();
    }

    function renderVendas() {
      var arr = DB.vendas;
      var tot = arr.reduce(function (a, v) { return a + v.total; }, 0);
      document.getElementById('vendaCount').textContent = arr.length + ' registro' + (arr.length !== 1 ? 's' : '') + (arr.length > 0 ? ' — total: ' + fmt(tot) : '');
      document.getElementById('vendasBody').innerHTML = arr.length === 0
        ? '<tr><td colspan="8"><div class="empty"><div class="empty-i">&#128722;</div>Nenhuma venda ainda.</div></td></tr>'
        : arr.map(function (v, i) {
          return '<tr>'
            + '<td>' + fmtDate(v.data) + '</td>'
            + '<td title="' + v.produto + '">' + v.produto + '</td>'
            + '<td><span class="badge b-gray">' + v.cat + '</span></td>'
            + '<td>' + fmtQ(v.qtd, v.unid || 'un') + '</td>'
            + '<td>' + fmt(v.preco) + '<span class="unid-tag">/' + (v.unid || 'un') + '</span></td>'
            + '<td><strong>' + fmt(v.total) + '</strong></td>'
            + '<td><span class="badge b-blue">' + v.pgto + '</span></td>'
            + '<td><button class="btn btn-sm btn-d" onclick="delItem(\'vendas\',' + i + ')">&#10005;</button></td>'
            + '</tr>';
        }).join('');
    }

    // ── CRUD ESTOQUE ──
    function addEstoque() {
      var nome = document.getElementById('eProdSel').value;
      if (!nome) { alert('Selecione o produto.'); return; }
      var p = getProd(nome);
      var item = { produto: nome, cat: p ? p.cat : '', unid: p ? p.unid : 'un', estoque: parseFloat(document.getElementById('eEst').value) || 0, validade: document.getElementById('eVal').value, lote: document.getElementById('eLote').value.trim() };
      var idx = DB.estoque.findIndex(function (x) { return x.produto === nome; });
      if (idx >= 0) DB.estoque[idx] = item; else DB.estoque.push(item);
      document.getElementById('eEst').value = '0';
      document.getElementById('eVal').value = '';
      document.getElementById('eLote').value = '';
      renderEstoque();
    }

    function renderEstoque() {
      var arr = DB.estoque;
      document.getElementById('estoqueCount').textContent = arr.length + ' item' + (arr.length !== 1 ? 's' : '') + ' em estoque';
      document.getElementById('estoqueBody').innerHTML = arr.length === 0
        ? '<tr><td colspan="8"><div class="empty"><div class="empty-i">&#128230;</div>Estoque vazio.</div></td></tr>'
        : arr.map(function (p, i) {
          var d = p.validade ? diasVencer(p.validade) : null;
          return '<tr>'
            + '<td title="' + p.produto + '">' + p.produto + '</td>'
            + '<td><span class="badge b-gray">' + p.cat + '</span></td>'
            + '<td>' + fmtQ(p.estoque, p.unid || 'un') + '</td>'
            + '<td>' + fmtDate(p.validade) + '</td>'
            + '<td>' + (d !== null ? d : '—') + '</td>'
            + '<td>' + (d !== null ? statusBadge(d) : '—') + '</td>'
            + '<td style="font-size:12px;color:var(--hint)">' + (p.lote || '—') + '</td>'
            + '<td><button class="btn btn-sm btn-d" onclick="delItem(\'estoque\',' + i + ')">&#10005;</button></td>'
            + '</tr>';
        }).join('');
    }

    // ── CRUD COMPRAS ──
    function addCompra() {
      var d = document.getElementById('cData').value;
      var f = document.getElementById('cForn').value.trim();
      var nome = document.getElementById('cProdSel').value || document.getElementById('cProd').value.trim();
      var q = parseFloat(document.getElementById('cQtd').value);
      var t = parseFloat(document.getElementById('cTotal').value);
      if (!d || !f || !nome || !q || !t || t <= 0) { alert('Preencha todos os campos obrigatórios.'); return; }
      var p = getProd(nome);
      DB.compras.push({ data: d, fornecedor: f, produto: nome, unid: p ? p.unid : 'un', qtd: q, total: t, nf: document.getElementById('cNF').value.trim() });
      document.getElementById('cForn').value = '';
      document.getElementById('cProd').value = '';
      document.getElementById('cQtd').value = '1';
      document.getElementById('cTotal').value = '';
      document.getElementById('cNF').value = '';
      renderCompras();
    }

    function renderCompras() {
      var arr = DB.compras;
      var tot = arr.reduce(function (a, c) { return a + parseFloat(c.total); }, 0);
      document.getElementById('compraCount').textContent = arr.length + ' registro' + (arr.length !== 1 ? 's' : '') + (arr.length > 0 ? ' — total: ' + fmt(tot) : '');
      document.getElementById('comprasBody').innerHTML = arr.length === 0
        ? '<tr><td colspan="7"><div class="empty"><div class="empty-i">&#128666;</div>Nenhuma compra ainda.</div></td></tr>'
        : arr.map(function (c, i) {
          return '<tr>'
            + '<td>' + fmtDate(c.data) + '</td>'
            + '<td title="' + c.fornecedor + '">' + c.fornecedor + '</td>'
            + '<td title="' + c.produto + '">' + c.produto + '</td>'
            + '<td>' + fmtQ(c.qtd, c.unid || 'un') + '</td>'
            + '<td><strong>' + fmt(c.total) + '</strong></td>'
            + '<td style="font-size:12px;color:var(--hint)">' + (c.nf || '—') + '</td>'
            + '<td><button class="btn btn-sm btn-d" onclick="delItem(\'compras\',' + i + ')">&#10005;</button></td>'
            + '</tr>';
        }).join('');
    }

    // ── DASHBOARD ──
    function makeChart(id, type, labels, data, colors, opts) {
      if (charts[id]) charts[id].destroy();
      var ctx = document.getElementById(id); if (!ctx) return;
      charts[id] = new Chart(ctx, { type: type, data: { labels: labels, datasets: [{ data: data, backgroundColor: colors, borderWidth: 0, borderRadius: type === 'bar' ? 3 : 0 }] }, options: Object.assign({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }, opts || {}) });
    }

    function renderDash() {
      var v = DB.vendas;
      var fat = v.reduce(function (a, x) { return a + x.total; }, 0);
      var ticket = v.length > 0 ? fat / v.length : 0;
      var comp = DB.compras.reduce(function (a, c) { return a + parseFloat(c.total); }, 0);
      var margem = fat > 0 ? ((fat - comp) / fat * 100) : 0;
      document.getElementById('kpiGrid').innerHTML =
        kpi('Qtd de vendas', v.length, '') +
        kpi('Faturamento total', fmt(fat), v.length > 0 ? 'ticket: ' + fmt(ticket) : '') +
        kpi('Total em compras', fmt(comp), '') +
        kpi('Margem bruta', fat > 0 ? margem.toFixed(1) + '%' : '—', 'faturamento − compras');

      var byCat = {};
      v.forEach(function (x) { byCat[x.cat] = (byCat[x.cat] || 0) + x.total; });
      var cL = Object.keys(byCat), cV = cL.map(function (k) { return +byCat[k].toFixed(2); });
      var cC = cL.map(function (k) { return COLORS[k] || '#888780'; });
      document.getElementById('legCat').innerHTML = cL.map(function (k, i) { return '<span class="leg-i"><span class="leg-dot" style="background:' + cC[i] + '"></span>' + k + (fat > 0 ? ' ' + (byCat[k] / fat * 100).toFixed(1) + '%' : '') + '</span>'; }).join('');
      makeChart('catChart', 'doughnut', cL, cV, cC, { cutout: '60%' });

      var byP = {};
      v.forEach(function (x) { byP[x.pgto] = (byP[x.pgto] || 0) + x.total; });
      var pL = Object.keys(byP), pV = pL.map(function (k) { return +byP[k].toFixed(2); });
      var pC = pL.map(function (k) { return PGTO_C[k] || '#888780'; });
      document.getElementById('legPgto').innerHTML = pL.map(function (k, i) { return '<span class="leg-i"><span class="leg-dot" style="background:' + pC[i] + '"></span>' + k + (fat > 0 ? ' ' + (byP[k] / fat * 100).toFixed(1) + '%' : '') + '</span>'; }).join('');
      makeChart('pgtoChart', 'doughnut', pL, pV, pC, { cutout: '60%' });

      var byProd = {};
      v.forEach(function (x) { byProd[x.produto] = (byProd[x.produto] || 0) + x.total; });
      var prods = Object.entries(byProd).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10);
      document.getElementById('prodWrap').style.height = Math.max(200, prods.length * 44 + 60) + 'px';
      if (prods.length > 0) {
        makeChart('prodChart', 'bar',
          prods.map(function (e) { return e[0]; }),
          prods.map(function (e) { return +e[1].toFixed(2); }),
          '#1D9E75',
          { indexAxis: 'y', scales: { x: { ticks: { callback: function (vv) { return 'R$ ' + vv; } }, grid: { color: 'rgba(0,0,0,0.05)' } }, y: { ticks: { font: { size: 12 } } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return ' ' + fmt(c.parsed.x); } } } } }
        );
      }

      var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      var al = DB.estoque.filter(function (p) { return p.validade && (new Date(p.validade + 'T00:00:00') - hoje) / 86400000 <= 30; }).sort(function (a, b) { return new Date(a.validade) - new Date(b.validade); });
      document.getElementById('alertasDiv').innerHTML = al.length === 0
        ? '<div class="empty"><div class="empty-i">&#10003;</div>Nenhum produto próximo do vencimento.</div>'
        : '<div class="tw"><table><thead><tr><th>Produto</th><th style="width:100px">Categoria</th><th style="width:110px">Qtd</th><th style="width:100px">Validade</th><th style="width:55px">Dias</th><th style="width:82px">Status</th></tr></thead><tbody>' +
        al.map(function (p) { var d = diasVencer(p.validade); return '<tr><td>' + p.produto + '</td><td>' + p.cat + '</td><td>' + fmtQ(p.estoque, p.unid || 'un') + '</td><td>' + fmtDate(p.validade) + '</td><td>' + d + '</td><td>' + statusBadge(d) + '</td></tr>'; }).join('') +
        '</tbody></table></div>';
    }

    function kpi(label, val, sub) {
      var s = String(val).length > 9 ? '16px' : '22px';
      return '<div class="kpi"><div class="kpi-lbl">' + label + '</div><div class="kpi-val" style="font-size:' + s + '">' + val + '</div>' + (sub ? '<div class="kpi-sub">' + sub + '</div>' : '') + '</div>';
    }

    // ── AÇÕES GERAIS ──
    function delItem(key, idx) {
      if (!confirm('Remover este registro?')) return;
      DB[key].splice(idx, 1);
      if (key === 'produtos') { renderProdutos(); popularSelects(); }
      else if (key === 'vendas') renderVendas();
      else if (key === 'estoque') renderEstoque();
      else renderCompras();
    }

    function clearAll(key) {
      if (!confirm('Apagar TODOS os registros de "' + key + '"?')) return;
      DB[key] = [];
      if (key === 'produtos') { renderProdutos(); popularSelects(); }
      else if (key === 'vendas') renderVendas();
      else if (key === 'estoque') renderEstoque();
      else renderCompras();
    }

    function exportCSV() {
      var csv = '\uFEFF=== PRODUTOS ===\nNome,Categoria,Unidade,Preco,Codigo\n';
      DB.produtos.forEach(function (p) { csv += '"' + p.nome + '",' + p.cat + ',' + p.unid + ',' + p.preco + ',' + (p.cod || '') + '\n'; });
      csv += '\n=== VENDAS ===\nData,Produto,Categoria,Qtd,Unidade,Preco,Total,Pagamento\n';
      DB.vendas.forEach(function (v) { csv += v.data + ',"' + v.produto + '",' + v.cat + ',' + v.qtd + ',' + v.unid + ',' + v.preco + ',' + v.total + ',' + v.pgto + '\n'; });
      csv += '\n=== ESTOQUE ===\nProduto,Categoria,Qtd,Unidade,Validade,Lote\n';
      DB.estoque.forEach(function (p) { csv += '"' + p.produto + '",' + p.cat + ',' + p.estoque + ',' + p.unid + ',' + p.validade + ',' + (p.lote || '') + '\n'; });
      csv += '\n=== COMPRAS ===\nData,Fornecedor,Produto,Qtd,Unidade,Total,NF\n';
      DB.compras.forEach(function (c) { csv += c.data + ',"' + c.fornecedor + '","' + c.produto + '",' + c.qtd + ',' + c.unid + ',' + c.total + ',' + (c.nf || '') + '\n'; });
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'boutique_queijo_dados.csv'; a.click();
    }

    function salvarArquivo() {
      var html = document.documentElement.outerHTML;
      html = html.replace(/var DB = \{[\s\S]*?\};/, 'var DB = ' + JSON.stringify(DB) + ';');
      var blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'boutique_queijo.html'; a.click();
      var el = document.getElementById('sn'); el.classList.add('show');
      setTimeout(function () { el.classList.remove('show'); }, 2500);
    }

    // ── INIT ──
    document.getElementById('vData').value = today();
    document.getElementById('cData').value = today();
    initTrial();
    renderDash(); renderProdutos(); renderVendas(); renderEstoque(); renderCompras();