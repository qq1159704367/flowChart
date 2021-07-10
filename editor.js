let line;
let lineText;
let lineAnchor;
let backNode;
let backbackNode;
let inNode;
let ancNode;
let KeyEvent;
let lines;
let fontSize;

let testNode;

let dcw, dew, dh;
let pw, ph,px,py;

let bfkfn, aftfn, DrawFunc,OnReAnchor;

let selectLine = -1, nowLine = -1;

String.prototype.insert = function (pos, ch) {
    return this.slice(0, pos) + ch + this.slice(pos)
}

String.prototype.remove = function (pos, n) {
    if (n == undefined)
        return this.substring(0, pos);
    else
        return this.slice(0, pos) + this.slice(pos + n)
}

Array.prototype.insert = function (idx, obj) {
    let t = this.slice(0, idx)
    t.push(obj)
    return t.concat(this.slice(idx))
}

function initEdit(node, inN, anc,bnode) {
    line = 0;
    lines = [];
    lineText = [];
    lineAnchor = [];
    backNode = node;
    backbackNode = bnode;
    pw = backbackNode.offsetWidth;
    ph = backbackNode.offsetHeight;
    px = backbackNode.offsetLeft;
    inNode = inN;
    ancNode = anc;
    lineText.push('');
    lineAnchor.push(0)

    testNode = document.createElement('font');
    testNode.style.width = 'fit-content';
    fontSize = node.getAttribute('fontSize')
    testNode.style.fontSize = fontSize;
    testNode.className = 'test'
    testNode.innerHTML = '1'.repeat(100)
    document.body.appendChild(testNode);
    dew = (testNode.offsetWidth) / 100;
    testNode.innerHTML = '啊'.repeat(100)
    dcw = (testNode.offsetWidth) / 100;
    dh = testNode.offsetHeight;
    document.body.removeChild(testNode);

    ancNode.style.height = dh + 'px';

    let dom = CreateLine(0)
    backNode.appendChild(dom);

    lines.push(dom)

    document.addEventListener('paste', onPaste);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);

    return {
        GetContent: GetContent,
        SetContent: SetText,
        GetLineText: GetLineText,
        InsertText: InsertText,
        GetAnchorPos: GetAnchorPos,
        SetBeforeKey: SetBeforeKey,
        SetAfterKey: SetAfterKey,
        SetOnChange: SetOnChange,
        SetOnLineCountChange: SetOnLineCountChange,
        setDisable: setDisable,
        focus: focus,
        SetSingleKeyDown: SetSingleKeyDown,
        RemoveText: RemoveText,
        GetChar: GetChar,
        MoveAnchor: MoveAnchor,
        AnchorToPos: AnchorToPos,
        GetAllLineText: GetAllLineText,
        SetDrawFunction: SetDrawFunction,
        SetLineText: SetLineText,
        SetLineError: SetLineError,
        SetOnReAnchor: SetOnReAnchor
    }
}

let selectS, selectE;

function SetLineError(l, val) {
    if (l >= 0 && l < lines.length)
        lines[l].style.background = val ? '#ffb2b2' : '';
}

function SetLineText(l, t) {
    lineText[l] = t;
    lines[l].innerHTML = normalDraw(l);
}

function SetDrawFunction(fn) {
    DrawFunc = fn
}

function SetOnReAnchor(fn) {
    OnReAnchor = fn;
}

function GetAllLineText() {
    return lineText
}

function GetChar(l, x) {
    return lineText[l].charAt(x);
}

function RemoveText(l, x, n) {
    lineText[l] = lineText[l].remove(x, n);
    lines[l].innerHTML = normalDraw(l)
    lineAnchor[l] = x;
    if (OnChange)
        OnChange()
    return { x: x, y: l }
}

function focus() {
    if (disable)
        return;
    inNode.focus();
    ancNode.style.visibility = ''
}

function Select(e) {
    return false;
}

function MoveAnchor(l, offset) {
    line = l;
    lineAnchor[l] += offset;
    ReAnchor()
}

function SetOnChange(fn) {
    OnChange = fn;
}

function SetSingleKeyDown(fn) {
    SingleKeyDown = fn;
}

function SetOnLineCountChange(fn) {
    OnLineCountChange = fn;
}

function setAnchor(l, idx) {
    line = l;
    lineAnchor[l] = idx;
}

function GetLineText(l) {
    return lineText[l];
}

function GetAnchorPos() {
    return { y: line, x: lineAnchor[line] };
}

function AnchorToPos(l, x) {
    let p = 0;
    for (let i = 0; i < l; i++) {
        p += lineText[i].length + 1;
    }
    p += x;
    return p;
}

function onPaste(evt) {
    if (disable)
        return
    clipdata = evt.clipboardData || window.clipboardData;
    let t = clipdata.getData('text/plain');
    if (selectS != undefined && selectE != undefined) {
        let s = DeleteSelectText()
        InsertText({ x: s[0].x, y: s[0].y }, t, true);
    } else {
        InsertText({ x: lineAnchor[line], y: line }, t, true);
    }
    inNode.value = ''
}

function InsertLine(idx, dom) {
    if (idx == lines.length - 1)
        backNode.appendChild(dom)
    else
        backNode.insertBefore(dom, lines[idx + 1]);
}

function InsertText(anchor, text, movanchor = false) {
    let anc = anchor || { x: lineAnchor[line], y: line };
    let t = text.split('\n');
    if (t.length <= 1) {
        lineText[anc.y] = lineText[anc.y].insert(anc.x, t);
        lines[anc.y].innerHTML = normalDraw(anc.y);
    } else {
        let r = lineText[anc.y].slice(anc.x);
        lineText[anc.y] = lineText[anc.y].slice(0, anc.x) + t[0];
        lines[anc.y].innerHTML = normalDraw(anc.y);
        let dom;
        for (let i = anc.y + 1; i < lines.length; i++) {
            lines[i].id = 'line_' + (i + t.length);
        }
        for (let i = anc.y + 1; i < anc.y + t.length - 1; i++) {
            dom = CreateLine(i);
            lineText = lineText.insert(i, t[i - anc.y]);
            lineAnchor = lineAnchor.insert(i, 0)
            dom.innerHTML = normalDraw(t[i - anc.y]);
            lines = lines.insert(i, dom);
            InsertLine(i, dom);
        }
        dom = CreateLine(anc.y + t.length - 1);
        InsertLine(anc.y + t.length - 2, dom);
        lines = lines.insert(anc.y + t.length - 1, dom);
        dom.innerHTML = normalDraw(t[t.length - 1] + r);
        lineText = lineText.insert(anc.y + t.length - 1, t[t.length - 1] + r);
        lineAnchor = lineAnchor.insert(anc.y + t.length - 1, 0)
    }
    if (movanchor) {
        line = anc.y + t.length - 1;
        if (t.length == 1)
            lineAnchor[line] = anc.x + t[t.length - 1].length;
        else
            lineAnchor[line] = t[t.length - 1].length;
    } else {
        line = anc.y;
        lineAnchor[line] = anc.x;
    }
    ReAnchor()
    ClearSelection()
    if (OnChange != undefined)
        OnChange();
    if (OnLineCountChange)
        OnLineCountChange()
    return { x: lineAnchor[line], y: line }
}
let disable = false

function setDisable(val) {
    disable = val;
    ancNode.style.visibility = val ? 'hidden' : ''
}

function SliceText_(s, e) {
    let t = []
    if (s.y == e.y)
        t.push(lineText[s.y].slice(s.x, e.x))
    else {
        t.push(lineText[s.y].slice(s.x));
        for (let i = s.y + 1; i <= e.y - 1; i++)
            t.push(lineText[i])
        t.push(lineText[e.y].slice(0, e.x));
    }
    return t.join('\n')
}

function onCopy(evt) {
    let clipdata = evt.clipboardData || window.clipboardData;
    if (selectS != undefined && selectE != undefined) {

        let s = [selectS, selectE];
        s.sort((a, b) => {
            if (a.y < b.y)
                return -1;
            else if (a.y == b.y)
                return a.x < b.x ? -1 : 1;
            else
                return 1;
        })
        let t = SliceText_(s[0], s[1]);

        clipdata.setData('text/plain', t);
        evt.preventDefault()
        line = s[1].y;
        lineAnchor[line] = s[1].x;
        ReAnchor()
        ClearSelection()
    }
}

function onCut(evt) {
    if (disable)
        return
    let clipdata = evt.clipboardData || window.clipboardData;
    if (selectS != undefined && selectE != undefined) {
        let s = [selectS, selectE];
        s.sort((a, b) => {
            if (a.y < b.y)
                return -1;
            else if (a.y == b.y)
                return a.x < b.x ? -1 : 1;
            else
                return 1;
        })
        let t = SliceText_(s[0], s[1]);

        clipdata.setData('text/plain', t);
        evt.preventDefault()

        DeleteSelectText()
        ReAnchor()
        ClearSelection()
        if (OnChange != undefined)
            OnChange();
        if (OnLineCountChange)
            OnLineCountChange()
    }
}

function input(e) {
    if (disable)
        return
    if (SingleKeyDown) {
        if (e.inputType == 'deleteContentBackward' || !SingleKeyDown({ mode: 'add', data: e.data, x: lineAnchor[line], y: line }))
            return
    }
    console.log(e)
    if (!KeyEvent)
        return;
    if (e.data != null && (KeyEvent?.key != 'Process' || KeyEvent?.code == 'Space' || KeyEvent?.code.slice(0, 5) == 'Digit' || KeyEvent?.shiftKey)) {
        KeyEvent = undefined;
        if (autoS) {
            SaveText()
            autoS = false
            if (AutoSTimer != undefined)
                clearTimeout(AutoSTimer)
            AutoSTimer = setTimeout(() => {
                autoS = true;
                AutoSTimer = undefined;
            }, 500);
        }
        if (selectS != undefined && selectE != undefined) {
            let s = DeleteSelectText()
            line = s[0].y;
            lineAnchor[line] = s[0].x;
        }
        lineText[line] = lineText[line].insert(lineAnchor[line], e.data);
        lineAnchor[line] = lineAnchor[line] + e.data.length;
        lines[line].innerHTML = normalDraw(line)
        ReAnchor()
        if (aftfn != undefined)
            if (!aftfn({ data: e.data, x: lineAnchor[line], y: line }))
                return;
    }
    console.log(lineText)
    if (OnChange != undefined)
        OnChange();
}

function Blur() {
    ancNode.style.visibility = 'hidden'
}

function lineClick(e) {
    if (disable)
        return
    let x = e.offsetX - 10;
    line = Number(e.currentTarget.id.split('_')[1]) - 1;
    lineAnchor[line] = lineText[line].GetAnchor(dcw, dew, x);
    inNode.focus()
    ReAnchor()
}

let times, delt;
let tapS = false;

function normalDraw(l) {
    let t;
    if (typeof l === 'number')
        t = lineText[l]
    else
        t = l
    if (DrawFunc)
        t = DrawFunc(t)
    return t;
}

function ClearSelection(c) {
    if (selectS != undefined && selectE != undefined) {
        console.log(selectS.y, selectE.y)
        try {
            for (let i = Math.min(selectS.y, selectE.y); i <= Math.max(selectE.y, selectS.y); i++) {
                lines[i].innerHTML = normalDraw(i);
            }
        } catch (e) {
            for (let i = 0; i < lines.length; i++)
                lines[i].innerHTML = normalDraw(i);
        }
    }
    if (!c) {
        selectS = undefined;
        selectE = undefined;
    }
}

function lineMouseDown(e) {
    if (disable)
        return
    ClearSelection(0);
    selectLine = Number(e.currentTarget.id.split('_')[1]) - 1;
    nowLine = selectLine;
    let x = e.pageX + backbackNode.scrollLeft - px;
    selectS = { x: lineText[selectLine].GetAnchor(dcw, dew, x - dew), y: selectLine };
    times = e.timeStamp;
    tapS = true;
}

function lineMouseMove(e) {
    if (disable)
        return
    if (tapS && e.buttons == 1) {
        delt = e.timeStamp - times;
        tapS = false;
    }

    if (e.buttons == 1) {
        if (e.pageX > px + pw - 10)
            backbackNode.scrollLeft = backbackNode.scrollLeft + dew;
        else if (e.pageX < px + 10)
            backbackNode.scrollLeft = backbackNode.scrollLeft - dew;
        
        if (e.pageY > py + ph - 10)
            backbackNode.scrollTop = backbackNode.scrollTop + dh;
        else if (e.pageY < py + 10)
            backbackNode.scrollTop = backbackNode.scrollTop - dh;
    }

    if (delt < 500) {
        ClearSelection(1)
        let l = Number(e.currentTarget.id.split('_')[1]) - 1;
        let x = e.pageX + backbackNode.scrollLeft - px;
        console.log(e.pageX,backbackNode.scrollLeft)
        let se = { x: lineText[l].GetAnchor(dcw, dew, x - dew), y: l };
        if (selectS.x == se.x && selectS.y == se.y)
            return;
        let ss = selectS;
        selectE = se;
        if (selectS.y > se.y || (selectS.y == se.y && selectS.x > se.x)) {
            ss = se;
            se = selectS;
        }
        if (ss.y == se.y) {
            let t = lineText[se.y]
            t = t.insert(se.x, '</font>');
            t = t.insert(ss.x, '<font class="select">');
            lines[ss.y].innerHTML = t;
        } else {
            let t = lineText[ss.y]
            t = t.insert(ss.x, '<font class="select">');
            t += '</font>';
            lines[ss.y].innerHTML = t;
            t = lineText[se.y]
            t = t.insert(se.x, '</font>');
            t = '<font class="select">' + t;
            lines[se.y].innerHTML = t;
            for (let i = ss.y + 1; i <= se.y - 1; i++)
                lines[i].innerHTML = '<font class="select">' + lineText[i] + '</font>';
        }
    }
}

function lineMouseIn(e) {
    if (disable)
        return
    if (delt >= 500) {
        let l = Number(e.currentTarget.id.split('_')[1]) - 1;
        if (l == nowLine)
            return;
        if (l > nowLine) {
            if (l > selectLine) {
                lines[l].style.top = (0 - dh) + 'px';
                lines[l].id = 'line_' + (l);
            }
            else {
                lines[l - 1].style.top = '0';
                lines[l - 1].id = 'line_' + (l);
            }
        } else if (l < nowLine) {
            if (l < selectLine) {
                lines[l].style.top = dh + 'px';
                lines[l].id = 'line_' + (l + 2);
            }
            else {
                lines[l + 1].style.top = '0';
                lines[l + 1].id = 'line_' + (l + 2);
            }
        }
        nowLine = l;
        lines[selectLine].style.top = (l - selectLine) * dh + 'px';
        lines[selectLine].id = 'line_' + (nowLine + 1);
    }
}

function DeleteSelectText() {
    if (selectS != undefined && selectE != undefined) {
        let s = [selectS, selectE];
        s.sort((a, b) => {
            if (a.y < b.y)
                return -1;
            else if (a.y == b.y)
                return a.x < b.x ? -1 : 1;
            else
                return 1;
        })
        if (s[0].y == s[1].y) {
            lineText[s[0].y] = lineText[s[0].y].remove(s[0].x, s[1].x - s[0].x);
            lines[s[0].y].innerHTML = normalDraw(s[0].y)
            lineAnchor[s[0].y] = s[0].x
        } else {
            lineText[s[0].y] = lineText[s[0].y].remove(s[0].x) + lineText[s[1].y].remove(0, s[1].x);;
            lines[s[0].y].innerHTML = normalDraw(s[0].y)

            lineText.splice(s[0].y + 1, s[1].y - s[0].y);
            lineAnchor.splice(s[0].y + 1, s[1].y - s[0].y);
            for (let i = s[0].y + 1; i <= s[1].y; i++)
                backNode.removeChild(lines[i]);
            lines.splice(s[0].y + 1, s[1].y - s[0].y);
            for (let i = s[0].y + 1; i < lines.length; i++)
                lines[i].id = 'line_' + (i + 1);
        }
        line = s[0].y;
        lineAnchor[line] = s[0].x;
        selectS = undefined;
        selectE = undefined;
        return s;
    }
}

function BackMouseUp() {
    if (disable)
        return
    if (delt > 500) {
        if (nowLine != selectLine) {
            if (nowLine < selectLine) {
                let t = lineText[selectLine]
                lineText.splice(selectLine, 1);
                lineText = lineText.insert(nowLine, t);

                t = lineAnchor[selectLine]
                lineAnchor.splice(selectLine, 1);
                lineAnchor = lineAnchor.insert(nowLine, t);
            } else {
                lineText = lineText.insert(nowLine + 1, lineText[selectLine]);
                lineText.splice(selectLine, 1);

                lineAnchor = lineAnchor.insert(nowLine + 1, lineAnchor[selectLine]);
                lineAnchor.splice(selectLine, 1);
            }
            for (let i = Math.min(nowLine, selectLine); i <= Math.max(nowLine, selectLine); i++) {
                lines[i].id = 'line_' + (i + 1)
                lines[i].style.top = '';
                lines[i].innerHTML = normalDraw(i)
            }
            if (OnChange != undefined)
                OnChange();
        }
        ReAnchor()
        nowLine = -1;
        selectLine = -1;
    }
    delt = undefined;
}

Array.prototype.swap = function (idx1, idx2) {
    let t = this[idx1]
    this[idx1] = this[idx2];
    this[idx2] = t;
}

function SetBeforeKey(fn) {
    bfkfn = fn;
}

function SetAfterKey(fn) {
    aftfn = fn;
}

function Resize() {
    pw = backbackNode.offsetWidth;
    ph = backbackNode.offsetHeight;
}

function GetContent() {
    return lineText.join('\n');
}

function CreateLine(l) {
    let dom = document.createElement('div')
    dom.className = 'e_line';
    dom.id = 'line_' + (l + 1);
    dom.onmouseup = lineClick;
    dom.onmousedown = lineMouseDown;
    dom.onmousemove = lineMouseMove;
    dom.onmouseenter = lineMouseIn;
    dom.onselectstart = Select;
    dom.style.lineHeight = dh + 'px';
    dom.style.fontSize = fontSize;
    dom.style.height = dh + 'px';
    return dom;
}
let AutoSTimer;
let autoS = true;
let reDo = [], yDo = []

function SaveText() {
    reDo.push({ t: lineText.join('\n').split('\n'), anchor: { x: lineAnchor[line], y: line } });
    if (reDo.length > 10)
        reDo.pop();
}

function SetText(text, anchor) {
    lineText = text.replace(/\r/, '').split('\n');
    lineAnchor = new Array(lineText.length).fill(0);
    Refresh();
    if (anchor != undefined) {
        line = anchor.y;
        lineAnchor[line] = anchor.x;
    }
}

function Refresh() {
    let ls = backNode.getElementsByClassName('e_line')
    for (let i = 0; i < ls.length;) {
        backNode.removeChild(ls[0]);
    }
    lines = []
    for (let i = 0; i < lineText.length; i++) {
        let dom = CreateLine(i);
        dom.innerHTML = normalDraw(i)
        backNode.appendChild(dom);
        lines.push(dom);
    }
    if (OnChange != undefined)
        OnChange();
    if (OnLineCountChange)
        OnLineCountChange();
}

function KeyDown(e) {
    if (disable)
        return
    KeyEvent = (e.ctrlKey && e.key == 'Ctrl') || (e.shiftKey && e.key == 'Shift') ? undefined : e
    if (bfkfn != undefined)
        if (!bfkfn(e))
            return;
    if (e.ctrlKey) {
        if (e.code == 'KeyA') {
            selectS = { x: 0, y: 0 };
            selectE = { x: lineText[lineText.length - 1].length, y: lineText.length - 1 };
            for (let i = 0; i < lines.length; i++)
                lines[i].innerHTML = '<font class="select">' + lineText[i] + '</font>';
        } else if (e.code == 'KeyR') {
            Refresh()
            e.cancelBubble = true;
            e.returnValue = false;
            return false
        } else if (e.code == 'KeyZ' && reDo.length != 0) {
            let t = reDo.pop();
            yDo.push({ t: lineText.join('\n').split('\n'), anchor: { x: lineAnchor[line], y: line } });
            lineText = t.t;
            line = t.anchor.y;
            lineAnchor = new Array(lineText.length).fill(0)
            lineAnchor[line] = t.anchor.x;
            Refresh();
            ReAnchor()
            console.log(yDo)
        } else if (e.code == 'KeyY' && yDo.length != 0) {
            let t = yDo.pop();
            lineText = t.t;
            line = t.anchor.y;
            lineAnchor = new Array(lineText.length).fill(0)
            lineAnchor[line] = t.anchor.x;
            Refresh();
            ReAnchor()
        }
        return;
    }
    switch (e.key) {
        case 'Enter':
            if (autoS) {
                SaveText()
                autoS = false
                if (AutoSTimer != undefined)
                    clearTimeout(AutoSTimer)
                AutoSTimer = setTimeout(() => {
                    autoS = true;
                    AutoSTimer = undefined;
                }, 500);
            }
            if (SingleKeyDown)
                if (!SingleKeyDown({ mode: 'add', data: 'Enter', x: lineAnchor[line], y: line }))
                    return;
            let p = lineAnchor[line];
            let left = lineText[line].slice(0, p);
            let right = lineText[line].slice(p);
            lineText[line] = left;
            lines[line].innerText = lineText[line]

            let dom = CreateLine(line + 1)
            if (line == lines.length - 1) {
                backNode.appendChild(dom);
                lines.push(dom)
            } else {
                for (let i = line + 1; i < lines.length; i++) {
                    lines[i].id = 'line_' + (i + 2)
                }
                backNode.insertBefore(dom, lines[line + 1])
                lines = lines.insert(line + 1, dom)
            }

            line++;
            lineText = lineText.insert(line, right);
            document.getElementById('line_' + (line + 1)).innerText = lineText[line]
            lineAnchor = lineAnchor.insert(line, 0);
            inNode.value = ''
            ReAnchor()
            if (OnChange != undefined)
                OnChange();
            if (OnLineCountChange)
                OnLineCountChange()
            break;
        case 'Backspace':
            if (autoS) {
                SaveText()
                autoS = false
                if (AutoSTimer != undefined)
                    clearTimeout(AutoSTimer)
                AutoSTimer = setTimeout(() => {
                    autoS = true;
                    AutoSTimer = undefined;
                }, 500);
            }
            if (selectS != undefined && selectE != undefined)
                DeleteSelectText()
            else {
                let data = null;
                if (lineAnchor[line] == 0) {
                    if (line > 0) {
                        lineAnchor[line - 1] = lineText[line - 1].length
                        lineText[line - 1] = lineText[line - 1].concat(lineText[line]);
                        lineText.splice(line, 1);
                        backNode.removeChild(lines[line])
                        lines.splice(line, 1);
                        line--;
                        lines[line].innerHTML = normalDraw(line)
                        for (let i = line + 1; i < lines.length; i++) {
                            lines[i].id = 'line_' + (i + 1)
                        }
                    }
                } else {
                    data = lineText[line].substr(lineAnchor[line] - 1, 1);
                    lineText[line] = lineText[line].remove(lineAnchor[line] - 1, 1);
                    lines[line].innerHTML = normalDraw(line)
                    lineAnchor[line] = lineAnchor[line] - 1;
                }
                if (SingleKeyDown)
                    SingleKeyDown({ mode: 'sub', data: data, x: lineAnchor[line], y: line });
            }
            ReAnchor()
            if (OnChange != undefined)
                OnChange();
            if (OnLineCountChange)
                OnLineCountChange()
            break;
        case 'ArrowLeft':
            lineAnchor[line] = lineAnchor[line] - 1;
            if (lineAnchor[line] < 0) {
                lineAnchor[line] = 0;
                if (line > 0) {
                    line--;
                    lineAnchor[line] = lineText[line].length;
                }
            }
            ReAnchor()
            break;
        case 'ArrowRight':
            lineAnchor[line] = lineAnchor[line] + 1;
            if (lineAnchor[line] > lineText[line].length) {
                lineAnchor[line] = lineText[line].length
                if (line < lineText.length - 1) {
                    line++;
                    lineAnchor[line] = 0;
                }
            }
            ReAnchor()
            break;
        case 'ArrowDown':
            if (line < lineText.length - 1) {
                if (lineAnchor[line] > lineText[line + 1].length)
                    lineAnchor[line + 1] = lineText[line + 1].length
                else
                    lineAnchor[line + 1] = lineAnchor[line]
                line++;
            }
            ReAnchor()
            break;
        case 'ArrowUp':
            if (line > 0) {
                if (lineAnchor[line] > lineText[line - 1].length)
                    lineAnchor[line - 1] = lineText[line - 1].length
                else
                    lineAnchor[line - 1] = lineAnchor[line]
                line--;
            }
            ReAnchor()
            break;
        case 'Tab':
            if (SingleKeyDown)
                SingleKeyDown({ mode: 'add', data: 'Tab', x: lineAnchor[line], y: line });
            break;
        default:
    }
    console.log(KeyEvent)
}

String.prototype.BufferLength = function () {
    let ct = 0, et = 0, i = 0;
    let ch = /[^\u4E00-\u9FA5]/;
    for (; i < this.length; i++) {
        if (!ch.test(this[i]))
            ct += 1;
        else
            et += 1;

    }
    return [ct, et];
}

String.prototype.GetAnchor = function (dcw, dew, x) {
    if (x < 0.4 * dew)
        return 0;
    let t = 0, i = 0;
    for (; i < this.length && t < x; i++) {
        if (this.charCodeAt(i) > 255)
            t += dcw;
        else
            t += dew;

    }
    return i;
}

function ReAnchor() {
    if (OnReAnchor)
        if (!OnReAnchor({ x: lineAnchor[line], y: line }))
            return
    let y = line * dh + 10;
    ancNode.style.top = y + 'px';
    let t = lineText[line].slice(0, lineAnchor[line]).BufferLength();
    let x = (15 + t[0] * dcw + t[1] * dew)
    ancNode.style.left = x + 'px';
    ancNode.style.visibility = ''
    if (x - backbackNode.scrollLeft > pw) {
        backbackNode.scrollLeft = x - pw + dew;
    } else if (x - dew < backbackNode.scrollLeft) {
        backbackNode.scrollLeft = x - dew;
    }
    if (y - backbackNode.scrollTop > ph - 2 * dh) {
        backbackNode.scrollTop = y - ph + 2 * dh;
    } else if (y - dh < backbackNode.scrollTop)
        backbackNode.scrollTop = y - dh;
}