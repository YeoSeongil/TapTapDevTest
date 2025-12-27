let isTulipMenuClick = false;
let lastSelectedHighlightType = 'what';
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// 전역 변수에 추가
let currentSelection = null;
let isMonitoringSelection = false;

// selection 변경 감지 함수 추가
function startMonitoringSelection() {
  isMonitoringSelection = true;
  
  const updateSelection = () => {
    if (!isMonitoringSelection) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();
      
      if (selectedText.length > 0) {
        currentSelection = {
          text: selectedText,
          range: range.cloneRange()
        };
        console.log('=== selection 업데이트됨 ===');
        console.log('새로 선택된 텍스트:', selectedText);
        console.log('===========================');
      }
    }
  };
  
  // iOS에서는 selectionchange 이벤트 사용
  document.addEventListener('selectionchange', updateSelection);
  
  // 터치 이벤트도 감지
  document.addEventListener('touchend', updateSelection);
}

function stopMonitoringSelection() {
  isMonitoringSelection = false;
}

// showTulipMenu 함수 수정
// showTulipMenu 함수 전체
function showTulipMenu(span) {
  if (document.getElementById('memo-box')) return;
  const existingMenu = document.getElementById('tulip-menu');
  if (existingMenu) existingMenu.remove();
  
  // *** selection 저장 및 모니터링 시작 ***
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    currentSelection = {
      text: range.toString().trim(),
      range: range.cloneRange()
    };
    console.log('=== showTulipMenu 시점의 selection 저장 ===');
    console.log('저장된 텍스트:', currentSelection.text);
    console.log('========================================');
  } else {
    currentSelection = null;
  }
  
  // selection 변경 모니터링 시작
  startMonitoringSelection();
  
  const menu = document.createElement('div');
  menu.id = 'tulip-menu';
  menu.dataset.originalSpan = span.dataset.draftId || Date.now();
  menu.addEventListener('click', e => e.stopPropagation());
  
  const buttons = [
    { text: '', type: 'what' },
    { text: '', type: 'why' },
    { text: '', type: 'detail' },
    { text: '', type: 'memo' }
  ];
  
  buttons.forEach(buttonInfo => {
    const button = document.createElement('button');
    if (buttonInfo.type === 'memo') {
      if (isDark) {
        button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.328 7.02367L5.54608 13.8056L4.62106 17.2557L4.01261 19.5286C3.99571 19.5921 3.9958 19.6589 4.01286 19.7224C4.02992 19.7859 4.06336 19.8437 4.10982 19.8902C4.15628 19.9366 4.21414 19.9701 4.2776 19.9871C4.34105 20.0042 4.40788 20.0043 4.47138 19.9874L6.74276 19.3782L10.1936 18.4532H10.1944L16.9763 11.6712L12.3288 7.02367H12.328ZM19.7806 7.80949L16.1913 4.21943C16.1218 4.14987 16.0393 4.09469 15.9486 4.05703C15.8578 4.01938 15.7604 4 15.6621 4C15.5639 4 15.4665 4.01938 15.3757 4.05703C15.2849 4.09469 15.2025 4.14987 15.133 4.21943L13.2807 6.07096L17.929 10.7193L19.7806 8.86697C19.8501 8.79753 19.9053 8.71505 19.943 8.62426C19.9806 8.53347 20 8.43614 20 8.33785C20 8.23956 19.9806 8.14224 19.943 8.05145C19.9053 7.96066 19.8501 7.87818 19.7806 7.80874" fill="#B9B9C0"/>
        </svg>`;
      } else {
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#5c5c6e" fill-rule="evenodd" d="m12.328 7.024-6.782 6.782-.925 3.45-.608 2.273a.375.375 0 0 0 .458.458l2.272-.609 3.45-.925h.001l6.782-6.782zm7.453.785-3.59-3.59a.75.75 0 0 0-1.058 0l-1.852 1.852 4.648 4.648 1.852-1.852a.75.75 0 0 0 0-1.058" clip-rule="evenodd"/></svg>`;
      }
    } else {
      button.textContent = buttonInfo.text;
    }
    
    button.dataset.highlightType = buttonInfo.type;
    
    if (buttonInfo.type === span.dataset.highlightType) {
      button.classList.add('selected');
    }
    
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      
      // 모니터링 중지
      stopMonitoringSelection();
      
      if (buttonInfo.type === 'memo') {
        const headerHeight = getFixedHeaderHeight();
        const spanRect = span.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const targetScrollTop = scrollTop + spanRect.top - headerHeight - 10;
        window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
        setTimeout(() => showMemoBox(span, null), 300);
        menu.remove();
      } else {
        // *** 최종 저장된 selection 사용 ***
        let newText = span.textContent.trim();
        let selectionChanged = false;
        let newRange = null;
        
        if (currentSelection && currentSelection.text.length > 0) {
          newText = currentSelection.text;
          newRange = currentSelection.range;
          
          // 원본과 다른지 확인
          if (newText !== span.textContent.trim()) {
            selectionChanged = true;
          }
        }
        
        const newType = buttonInfo.type;
        
        console.log('=== 하이라이트 수정 정보 ===');
        console.log('선택된 타입:', newType);
        console.log('선택된 텍스트:', newText);
        console.log('텍스트 길이:', newText.length);
        console.log('드래그로 수정됨:', selectionChanged);
        console.log('원본 텍스트:', span.textContent.trim());
        console.log('최종 저장된 selection:', currentSelection);
        console.log('==========================');
        
        // *** 실제 span 수정 로직 수정 ***
        if (selectionChanged && newRange) {
          console.log('하이라이트 영역 수정 시작');
          
          try {
            // 1. 기존 span의 draftId와 comments 저장
            const draftId = span.dataset.draftId;
            const comments = JSON.parse(span.dataset.comments || '[]');
            
            console.log('기존 draftId:', draftId);
            console.log('기존 comments:', comments);
            
            // 2. 기존 capsule container 제거
            if (span.nextElementSibling && span.nextElementSibling.classList.contains('capsule-container')) {
              span.nextElementSibling.remove();
            }
            
            // 3. 새로운 span 생성
            const newSpan = document.createElement('span');
            newSpan.className = 'highlighted-text';
            newSpan.dataset.highlightType = newType;
            newSpan.dataset.draftId = draftId;
            
            console.log('새 span에 draftId 설정:', newSpan.dataset.draftId);
            
            // comments의 타입도 업데이트
            if (comments.length > 0) {
              comments.forEach(comment => comment.type = newType);
            }
            newSpan.dataset.comments = JSON.stringify(comments);
            
            // 4. range를 복사
            const clonedRange = newRange.cloneRange();
            
            console.log('Range 정보:', {
              startContainer: clonedRange.startContainer,
              startOffset: clonedRange.startOffset,
              endContainer: clonedRange.endContainer,
              endOffset: clonedRange.endOffset,
              text: clonedRange.toString()
            });
            
            // 5. 기존 span을 먼저 제거하고 새로운 하이라이트 적용
            try {
              // *** range를 저장하기 위해 startNode, endNode, offset 기록 ***
              const rangeInfo = {
                startContainer: clonedRange.startContainer,
                startOffset: clonedRange.startOffset,
                endContainer: clonedRange.endContainer,
                endOffset: clonedRange.endOffset,
                text: clonedRange.toString()
              };
              
              console.log('Range 정보 저장:', rangeInfo);
              
              // *** 먼저 기존 span을 제거 ***
              console.log('기존 span 제거 시작');
              if (span.parentNode) {
                const spanParent = span.parentNode;
                
                // span의 자식들을 fragment로 추출
                const fragment = document.createDocumentFragment();
                while (span.firstChild) {
                  fragment.appendChild(span.firstChild);
                }
                
                // span을 fragment로 교체
                spanParent.replaceChild(fragment, span);
                spanParent.normalize();
                console.log('기존 span 제거 완료');
              }
              
              // *** 텍스트 검색으로 새로운 하이라이트 적용 ***
              console.log('새로운 하이라이트 적용 시작 (텍스트 검색)');
              
              const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                  acceptNode: function(node) {
                    if (node.parentElement && node.parentElement.classList.contains('highlighted-text')) {
                      return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                  }
                }
              );
              
              let textNode;
              let found = false;
              
              // 전체 텍스트 구성하여 찾기 (여러 노드에 걸쳐있을 수 있음)
              const textNodes = [];
              while (textNode = walker.nextNode()) {
                if (textNode.textContent.trim().length > 0) {
                  textNodes.push(textNode);
                }
              }
              
              let fullText = '';
              const map = [];
              for (const tn of textNodes) {
                const start = fullText.length;
                const end = start + tn.textContent.length;
                map.push({ node: tn, start, end });
                fullText += tn.textContent;
              }
              
              // 텍스트 찾기
              let searchIndex = fullText.indexOf(newText);
              if (searchIndex === -1) {
                searchIndex = fullText.indexOf(newText.trim());
              }
              
              if (searchIndex !== -1) {
                console.log('텍스트 발견, index:', searchIndex);
                
                const sentenceStart = searchIndex;
                const sentenceEnd = searchIndex + newText.length;
                
                let startNode = null, startOffset = 0;
                let endNode = null, endOffset = 0;
                
                for (const m of map) {
                  if (sentenceStart >= m.start && sentenceStart < m.end) {
                    startNode = m.node;
                    startOffset = sentenceStart - m.start;
                  }
                  if (sentenceEnd >= m.start && sentenceEnd <= m.end) {
                    endNode = m.node;
                    endOffset = sentenceEnd - m.start;
                  }
                }
                
                if (startNode && endNode) {
                  const newRange = document.createRange();
                  newRange.setStart(startNode, startOffset);
                  newRange.setEnd(endNode, endOffset);
                  
                  newSpan.appendChild(newRange.extractContents());
                  newRange.insertNode(newSpan);
                  
                  found = true;
                  console.log('새로운 하이라이트 적용 완료');
                  console.log('새 span의 textContent:', newSpan.textContent);
                }
              }
              
              if (!found) {
                throw new Error('텍스트를 찾을 수 없음');
              }
              
              // 6. capsule 렌더링
              renderCapsules(newSpan);
              
              // 7. draft 업데이트
              console.log('updateDraft 호출 전 - newSpan.dataset.draftId:', newSpan.dataset.draftId);
              console.log('updateDraft 호출 전 - newText:', newText);
              console.log('updateDraft 호출 전 - newSpan.textContent:', newSpan.textContent.trim());
              console.log('둘이 같은가?', newText === newSpan.textContent.trim());

              await updateDraft(newSpan, newText);
              
              // 8. 저장 확인
              setTimeout(async () => {
                const data = await browser.storage.local.get('draftHighlights');
                console.log('=== 저장 후 스토리지 확인 ===');
                const savedDraft = data.draftHighlights?.find(d => d.id === draftId);
                console.log('저장된 draft:', savedDraft);
                console.log('===========================');
              }, 500);
              
              console.log('하이라이트 영역 수정 완료');
              
            } catch (rangeError) {
              console.error('하이라이트 적용 중 오류:', rangeError);
              
              // 대체 방법
              const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                  acceptNode: function(node) {
                    if (node.parentElement && node.parentElement.classList.contains('highlighted-text')) {
                      return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                  }
                }
              );
              
              let textNode;
              let found = false;
              while (textNode = walker.nextNode()) {
                const index = textNode.textContent.indexOf(newText);
                if (index !== -1) {
                  const fallbackRange = document.createRange();
                  fallbackRange.setStart(textNode, index);
                  fallbackRange.setEnd(textNode, index + newText.length);
                  
                  const fallbackSpan = document.createElement('span');
                  fallbackSpan.className = 'highlighted-text';
                  fallbackSpan.dataset.highlightType = newType;
                  fallbackSpan.dataset.draftId = draftId;
                  fallbackSpan.dataset.comments = JSON.stringify(comments);
                  
                  console.log('대체방법 - draftId 설정:', fallbackSpan.dataset.draftId);
                  
                  fallbackSpan.appendChild(fallbackRange.extractContents());
                  fallbackRange.insertNode(fallbackSpan);
                  
                  renderCapsules(fallbackSpan);
                  await updateDraft(fallbackSpan, newText);
                  
                  setTimeout(async () => {
                    const data = await browser.storage.local.get('draftHighlights');
                    console.log('=== 대체방법 저장 후 스토리지 확인 ===');
                    const savedDraft = data.draftHighlights?.find(d => d.id === draftId);
                    console.log('저장된 draft:', savedDraft);
                    console.log('=====================================');
                  }, 500);
                  
                  found = true;
                  console.log('하이라이트 영역 수정 완료 (대체 방법)');
                  break;
                }
              }
              
              if (!found) {
                console.error('대체 방법으로도 텍스트를 찾지 못했습니다');
              }
            }
            
          } catch (e) {
            console.error('하이라이트 영역 수정 중 오류:', e);
          }
        } else {
          // 선택 영역 변경 없이 타입만 변경
          span.dataset.highlightType = newType;
          let comments = JSON.parse(span.dataset.comments || '[]');
          if (comments.length > 0) {
            comments.forEach(comment => comment.type = newType);
            span.dataset.comments = JSON.stringify(comments);
            renderCapsules(span);
          }
          await updateDraft(span);
        }
        
        menu.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');

        setTimeout(() => { isTulipMenuClick = false; }, 100);
        lastSelectedHighlightType = newType;
        
        // 메뉴 제거
        menu.remove();
      }
    });
    
    menu.appendChild(button);
  });
  
  document.body.appendChild(menu);
  
  const spanRect = span.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const fixedHeaderHeight = getFixedHeaderHeight();

  const spaceAvailableAbove = spanRect.top - fixedHeaderHeight;
  if (menuRect.height + 10 > spaceAvailableAbove) {
      const scrollAmount = menuRect.height + 10 - spaceAvailableAbove;
  }

  const newSpanRect = span.getBoundingClientRect();
  const newMenuRect = menu.getBoundingClientRect();

  let left = window.scrollX + newSpanRect.left + (newSpanRect.width / 2) - (newMenuRect.width / 2);
  if (left < window.scrollX) left = window.scrollX + 10;
  if (left + newMenuRect.width > window.scrollX + window.innerWidth)
      left = window.scrollX + window.innerWidth - newMenuRect.width - 10;

  let top = window.scrollY + newSpanRect.top - newMenuRect.height - 14;

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

function getFixedHeaderHeight() {
  let fixedHeaderHeight = 0;
  const elements = document.querySelectorAll('body *');
  for (const el of elements) {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' && el.offsetHeight > 0) {
      const rect = el.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < 50) {
        fixedHeaderHeight = Math.max(fixedHeaderHeight, rect.bottom);
      }
    }
  }
  return fixedHeaderHeight;
}

function getMemoKey(type) {
  if (!type) return null;
  return 'memo' + type.charAt(0).toUpperCase() + type.slice(1);
}

function renderCapsules(span) {
  if (span.nextElementSibling && span.nextElementSibling.classList.contains('capsule-container')) {
    span.nextElementSibling.remove();
  }
  
  const comments = JSON.parse(span.dataset.comments || '[]');
  
  if (comments.length > 0) {
    const container = document.createElement('div');
    container.className = 'capsule-container';
    span.after(container);
    
    comments.forEach(comment => {
      const capsule = document.createElement('div');
      capsule.className = 'memo-capsule';
      capsule.dataset.memoType = comment.type;
      
      const textPreview = document.createElement('span');
      textPreview.className = 'capsule-text';
      textPreview.textContent = comment.text;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'capsule-delete-btn';
      const svgContainer = document.createElement('div');
      svgContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path stroke="#71717a" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M21 11 11 21M11 11l10 10"/></svg>';
      deleteBtn.appendChild(svgContainer.firstChild);
      
      capsule.appendChild(textPreview);
      capsule.appendChild(deleteBtn);
      
      capsule.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const tulipMenu = document.getElementById('tulip-menu');
        if (tulipMenu) {
          tulipMenu.remove();
        }
        
        const isAlreadyClicked = capsule.classList.contains(`clicked-${comment.type}`);
        const memoBoxOpenForThisCapsule = document.getElementById('memo-box') && Number(document.getElementById('memo-box').dataset.editingId) === comment.id;

        document.querySelectorAll('.memo-capsule.clicked-what, .memo-capsule.clicked-why, .memo-capsule.clicked-detail').forEach(c => {
          c.classList.remove('clicked-what', 'clicked-why', 'clicked-detail');
        });

        if (isAlreadyClicked && memoBoxOpenForThisCapsule) {
          closeMemoBox();
          return;
        }

        capsule.classList.add(`clicked-${comment.type}`);
        showMemoBox(span, comment.id);
      });
      
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const memoBox = document.getElementById('memo-box');
        if (memoBox && Number(memoBox.dataset.editingId) === comment.id) {
          memoBox.remove();
        }
        
        const updatedComments = JSON.parse(span.dataset.comments || '[]').filter(m => m.id !== comment.id);
        span.dataset.comments = JSON.stringify(updatedComments);
        renderCapsules(span);
        updateDraft(span);
      });
      
      container.appendChild(capsule);
    });
  }
}

function closeMemoBox() {
    const memoBox = document.getElementById('memo-box');
    if (!memoBox) return;

    const span = document.querySelector(`[data-draft-id="${memoBox.dataset.highlightId}"]`);
    if (!span) return;

    const textarea = memoBox.querySelector('textarea');
    const commentText = textarea.value.trim();
    let updatedComments = JSON.parse(span.dataset.comments || '[]');
    const memoId = Number(memoBox.dataset.editingId);

    if (memoId) {
        const commentIndex = updatedComments.findIndex(m => m.id === memoId);
        if (commentIndex > -1) {
            if (commentText) {
                updatedComments[commentIndex].text = commentText;
            } else {
                updatedComments.splice(commentIndex, 1);
            }
        }
    } else {
        if (commentText) {
            const newComment = {
                id: Date.now(),
                type: span.dataset.highlightType,
                text: commentText
            };
            updatedComments.push(newComment);
        }
    }

    span.dataset.comments = JSON.stringify(updatedComments);
    memoBox.remove();
    renderCapsules(span);
    updateDraft(span);

    document.querySelectorAll('.memo-capsule.clicked-what, .memo-capsule.clicked-why, .memo-capsule.clicked-detail').forEach(c => {
        c.classList.remove('clicked-what', 'clicked-why', 'clicked-detail');
    });
}

function showMemoBox(span, memoId = null) {
  closeMemoBox();

  const comments = JSON.parse(span.dataset.comments || '[]');
  const currentComment = memoId ? comments.find(m => m.id === memoId) : null;
  
  const memoBox = document.createElement('div');
  memoBox.id = 'memo-box';
  memoBox.dataset.highlightId = span.dataset.draftId;
  if (memoId) {
    memoBox.dataset.editingId = memoId;
  }
  memoBox.addEventListener('click', e => e.stopPropagation());
  
  const currentHighlightType = currentComment ? currentComment.type : span.dataset.highlightType;
  const existingText = currentComment ? currentComment.text : '';
  
  const textarea = document.createElement('textarea');
  textarea.placeholder = '중요한 내용이나 생각을 입력해보세요';
  textarea.value = existingText;
  memoBox.appendChild(textarea);

  textarea.addEventListener('blur', closeMemoBox);
  
  span.after(memoBox);
  textarea.focus();
}

function isInsideQuotes(text, index) {
  const quoteChars = ['"', "'", '“', '”', '‘', '’'];
  let count = 0;
  for (let i = 0; i < index; i++) {
    if (quoteChars.includes(text[i])) count++;
  }
  return count % 2 === 1;
}

function showDeleteConfirmationModal(onConfirm) {
  const existingModal = document.getElementById('delete-confirm-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modalContainer = document.createElement('div');
  modalContainer.id = 'delete-confirm-modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  modalContent.addEventListener('click', e => e.stopPropagation());

  const title = document.createElement('h3');
  title.textContent = '해당 하이라이트를 삭제할까요?';
  
  const message = document.createElement('p');
  message.textContent = '메모도 함께 삭제되며,\n삭제한 하이라이트는 복구할 수 없어요';
  message.style.whiteSpace = 'pre-line';

  const separator = document.createElement('div');
  separator.className = 'modal-separator';

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'modal-buttons';

  const cancelButton = document.createElement('button');
  cancelButton.textContent = '취소';
  cancelButton.onclick = () => {
    modalContainer.remove();
  };

  const verticalSeparator = document.createElement('div');
  verticalSeparator.className = 'vertical-separator';

  const confirmButton = document.createElement('button');
  confirmButton.className = 'delete-btn';
  confirmButton.textContent = '삭제';
  confirmButton.onclick = () => {
    onConfirm();
    modalContainer.remove();
  };

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(verticalSeparator);
  buttonContainer.appendChild(confirmButton);

  modalContent.appendChild(title);
  modalContent.appendChild(message);
  modalContent.appendChild(separator);
  modalContent.appendChild(buttonContainer);
  
  modalContainer.appendChild(modalContent);

  modalContainer.addEventListener('click', () => {
    modalContainer.remove();
  });

  document.body.appendChild(modalContainer);
}

document.addEventListener('dblclick', async function(event) {
  if (event.target.closest('.memo-capsule')) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  const existingHighlight = event.target.closest('.highlighted-text');
  if (existingHighlight) {
    event.preventDefault();
    event.stopPropagation();
    const comments = JSON.parse(existingHighlight.dataset.comments || '[]');
    const deleteHighlight = () => {
      const draftId = existingHighlight.dataset.draftId;
      const existingMenu = document.getElementById('tulip-menu');
      if (existingMenu) existingMenu.remove();
      const existingMemoBox = document.getElementById('memo-box');
      if (existingMemoBox) existingMemoBox.remove();
      const capsuleContainer = existingHighlight.nextElementSibling;
      if (capsuleContainer && capsuleContainer.classList.contains('capsule-container')) capsuleContainer.remove();
      const parent = existingHighlight.parentNode;
      existingHighlight.replaceWith(...existingHighlight.childNodes);
      if (parent) parent.normalize();
      deleteDraft(draftId);
    };
    if (comments.length > 0) showDeleteConfirmationModal(deleteHighlight);
    else deleteHighlight();
    return;
  }

  if (event.target.closest('#tulip-menu') || event.target.closest('#memo-box') || event.target.closest('#delete-confirm-modal')) return;

  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const clickedElement = range.commonAncestorContainer;
  let textNode = clickedElement;
  if (textNode.nodeType !== Node.TEXT_NODE) {
    const treeWalker = document.createTreeWalker(clickedElement, NodeFilter.SHOW_TEXT);
    let currentNode;
    while (currentNode = treeWalker.nextNode()) {
      if (range.intersectsNode(currentNode)) {
        textNode = currentNode;
        break;
      }
    }
    if (textNode.nodeType !== Node.TEXT_NODE) return;
  }

  // 전체 텍스트를 만들고 클릭 위치를 fullText 상의 index로 변환
  const { fullText, map } = buildUnifiedText(textNode);

  let clickIndex = 0;
  for (const m of map) {
    if (m.node === textNode) {
      clickIndex = m.start + range.startOffset;
      break;
    }
  }

  const text = fullText;          // 기존 변수 재활용 → 최소 변경
  const clickPosition = clickIndex;

  let sentenceStart = 0;
  for (let i = clickPosition - 1; i >= 0; i--) {
    const char = text[i];
    if ('.?!'.includes(char)) {
      if (char === '.' && /\d/.test(text[i - 1]) && /\d/.test(text[i + 1])) continue;
      if (char === '.' && i > 0 && /[A-Z]/.test(text[i - 1]) && (i === 1 || text[i - 2] === ' ')) continue;
      if (isInsideQuotes(text, i)) continue;
      sentenceStart = i + 1;
      if (i + 1 < text.length && /\s/.test(text[i + 1])) sentenceStart++;
      break;
    }
  }

  let sentenceEnd = text.length;
  for (let i = clickPosition; i < text.length; i++) {
    const char = text[i];
    if ('.?!'.includes(char)) {
      if (char === '.' && /\d/.test(text[i - 1]) && /\d/.test(text[i + 1])) continue;
      if (char === '.' && i > 0 && /[A-Z]/.test(text[i - 1]) && (i === 1 || text[i - 2] === ' ')) continue;
      if (isInsideQuotes(text, i)) continue;
      const nextChar = text[i + 1];
      if ([])
      sentenceEnd = i + 1;
      break;
    }
  }

  const sentenceRange = document.createRange();

  // 문장 시작 위치 → 어느 node인지 찾기
  for (const m of map) {
    if (sentenceStart >= m.start && sentenceStart <= m.end) {
      sentenceRange.setStart(m.node, sentenceStart - m.start);
      break;
    }
  }

  // 문장 끝 위치 → 어느 node인지 찾기
  for (const m of map) {
    if (sentenceEnd >= m.start && sentenceEnd <= m.end) {
      sentenceRange.setEnd(m.node, sentenceEnd - m.start);
      break;
    }
  }

  let extractedText = sentenceRange.toString();
  const leadingWhitespaceLength = extractedText.length - extractedText.trimStart().length;
  if (leadingWhitespaceLength > 0) {
    const newSentenceStart = sentenceStart + leadingWhitespaceLength;
    for (const m of map) {
        if (newSentenceStart >= m.start && newSentenceStart <= m.end) {
            sentenceRange.setStart(m.node, newSentenceStart - m.start);
            break;
        }
    }
  }
  
  if (sentenceRange.toString().trim().length < 3) return;

  const allHighlights = document.querySelectorAll('.highlighted-text');
  for (const highlight of allHighlights) {
    const highlightRange = document.createRange();
    highlightRange.selectNodeContents(highlight);
    if (sentenceRange.compareBoundaryPoints(Range.END_TO_START, highlightRange) < 0 &&
        sentenceRange.compareBoundaryPoints(Range.START_TO_END, highlightRange) > 0) return;
  }

  const span = document.createElement('span');
  span.className = 'highlighted-text';
  span.dataset.highlightType = lastSelectedHighlightType;

  try {
    span.appendChild(sentenceRange.extractContents());
    sentenceRange.insertNode(span);

    // 이 부분이 드래그 영역 선택하는 문장
    const selection = window.getSelection();
    selection.removeAllRanges();

    const highlightRange = document.createRange();
    highlightRange.selectNodeContents(span);
    selection.addRange(highlightRange);
    
    showTulipMenu(span);
    saveDraft(span);
  } catch (e) {
    console.error("하이라이트 적용 중 오류 발생:", e);
  }
});

async function saveDraft(highlightSpan) {
  const draft = {
    id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sentence: highlightSpan.textContent.trim(),
    type: highlightSpan.dataset.highlightType,
    comments: JSON.parse(highlightSpan.dataset.comments || '[]'),
    url: window.location.href,
    createdAt: new Date().toISOString(),
    isDraft: true
  };
  
  try {
    const data = await browser.storage.local.get('draftHighlights');
    const drafts = data.draftHighlights || [];
    drafts.push(draft);
    await browser.storage.local.set({ draftHighlights: drafts });
    console.log('새로운 하이라이트 초안을 저장했습니다:', draft);
    highlightSpan.dataset.draftId = draft.id;
  } catch (e) {
    console.error('초안 저장 중 오류 발생:', e);
  }
}
async function updateDraft(highlightSpan, customText = null) {
  const draftId = highlightSpan.dataset.draftId;
  
  console.log('=== updateDraft 함수 시작 ===');
  console.log('draftId:', draftId);
  console.log('customText:', customText);
  console.log('span.textContent:', highlightSpan.textContent.trim());
  
  if (!draftId) {
    console.log("updateDraft: 초안 ID가 없는 하이라이트입니다. 업데이트를 건너뜁니다.");
    return;
  }
  
  try {
    console.log('스토리지에서 데이터 가져오는 중...');
    const data = await browser.storage.local.get('draftHighlights');
    console.log('가져온 전체 drafts:', data.draftHighlights);
    
    const drafts = data.draftHighlights || [];
    const draftIndex = drafts.findIndex(d => d.id === draftId);
    
    console.log('찾은 draftIndex:', draftIndex);
    
    if (draftIndex > -1) {
      console.log('수정 전 draft:', drafts[draftIndex]);
      
      drafts[draftIndex].type = highlightSpan.dataset.highlightType;
      drafts[draftIndex].comments = JSON.parse(highlightSpan.dataset.comments || '[]');
      
      // *** customText가 있으면 그것을 사용, 없으면 span의 textContent 사용 ***
      if (customText !== null) {
        drafts[draftIndex].sentence = customText;
        console.log('customText로 업데이트:', customText);
      } else {
        drafts[draftIndex].sentence = highlightSpan.textContent.trim();
        console.log('span textContent로 업데이트:', highlightSpan.textContent.trim());
      }
      
      console.log('수정 후 draft:', drafts[draftIndex]);
      console.log('스토리지에 저장 시작...');
      
      await browser.storage.local.set({ draftHighlights: drafts });
      
      console.log('스토리지에 저장 완료!');
      console.log('하이라이트 초안을 수정했습니다:', drafts[draftIndex]);
      
      // 즉시 확인
      const verifyData = await browser.storage.local.get('draftHighlights');
      console.log('저장 직후 확인:', verifyData.draftHighlights?.find(d => d.id === draftId));
      
    } else {
      console.warn("updateDraft: 수정할 초안을 찾지 못했습니다:", draftId);
      console.warn("현재 스토리지의 모든 draft IDs:", drafts.map(d => d.id));
    }
  } catch (e) {
    console.error('초안 수정 중 오류 발생:', e);
    console.error('오류 스택:', e.stack);
  }
  
  console.log('=== updateDraft 함수 종료 ===');
}

function findAndApplyHighlights(savedHighlights) {
  console.log('=== findAndApplyHighlights 시작 ===');
  console.log('적용할 하이라이트 개수:', savedHighlights?.length);
  
  if (!savedHighlights || savedHighlights.length === 0) {
    console.log('적용할 하이라이트가 없습니다.');
    return;
  }
  
  // 각 하이라이트를 개별적으로 처리
  savedHighlights.forEach((saved, idx) => {
    if (saved.applied) {
      console.log(`하이라이트 #${idx} 이미 적용됨, 건너뜀`);
      return;
    }
    
    console.log(`\n--- 하이라이트 #${idx} 처리 시작 ---`);
    console.log('찾을 텍스트 (전체):', saved.sentence);
    console.log('텍스트 길이:', saved.sentence.length);
    
    // 공백 정규화된 버전 생성
    const normalizedSentence = saved.sentence.replace(/\s+/g, ' ').trim();
    
    // buildUnifiedText 방식으로 전체 텍스트 구성
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // 이미 하이라이트된 노드는 제외
          if (node.parentElement && node.parentElement.classList.contains('highlighted-text')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let textNode;
    while (textNode = walker.nextNode()) {
      if (textNode.textContent.trim().length > 0) {
        textNodes.push(textNode);
      }
    }
    
    // 전체 텍스트 구성
    let fullText = '';
    const map = [];
    for (const tn of textNodes) {
      const start = fullText.length;
      const end = start + tn.textContent.length;
      map.push({ node: tn, start, end });
      fullText += tn.textContent;
    }

    // 1. 원본 텍스트에서 직접 찾기
    let searchIndex = fullText.indexOf(saved.sentence);

    // 2. 못 찾으면 trim해서 찾기
    if (searchIndex === -1) {
      const trimmedSentence = saved.sentence.trim();
      searchIndex = fullText.indexOf(trimmedSentence);
      
      if (searchIndex !== -1) {
        console.log('trim 후 발견!');
      }
    }

    // 3. 그래도 못 찾으면 정규화 (하지만 이 경우 길이가 달라질 수 있음)
    if (searchIndex === -1) {
      console.log('❌ 원본 및 trim된 텍스트에서 찾지 못함');
      console.log('저장된 텍스트:', saved.sentence.substring(0, 100));
      console.log('페이지 텍스트 샘플:', fullText.substring(0, 200));
      return;
    }

    console.log('✓ 전체 텍스트에서 발견! index:', searchIndex);

    // 시작 위치와 끝 위치의 노드 찾기
    const sentenceStart = searchIndex;
    const sentenceEnd = searchIndex + saved.sentence.length; // 원본 길이 사용!
    
    let startNode = null, startOffset = 0;
    let endNode = null, endOffset = 0;
    
    for (const m of map) {
      if (sentenceStart >= m.start && sentenceStart < m.end) {
        startNode = m.node;
        startOffset = sentenceStart - m.start;
      }
      if (sentenceEnd >= m.start && sentenceEnd <= m.end) {
        endNode = m.node;
        endOffset = sentenceEnd - m.start;
      }
    }
    
    if (!startNode || !endNode) {
      console.log('❌ 시작/끝 노드를 찾지 못함');
      return;
    }
    
    console.log('시작 노드 찾음, offset:', startOffset);
    console.log('끝 노드 찾음, offset:', endOffset);
    
    try {
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      
      const span = document.createElement('span');
      span.className = 'highlighted-text';
      
      if (saved.isDraft) {
        span.dataset.draftId = saved.id;
      } else if (saved.id) {
        span.dataset.id = saved.id;
      }
      
      const type = saved.type || saved.highlightType;
      span.dataset.highlightType = type;
      span.dataset.comments = JSON.stringify(saved.comments || '[]');
      
      // 여러 노드에 걸쳐있으면 surroundContents가 실패할 수 있으므로
      // extractContents + insertNode 방식 사용
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      
      renderCapsules(span);
      saved.applied = true;
      console.log('✅ 하이라이트 적용 성공');
      
    } catch (e) {
      console.error("❌ 하이라이트 적용 중 오류 발생:", e);
      console.error("오류 내용:", e.message);
    }
  });
  
  const successCount = savedHighlights.filter(h => h.applied).length;
  console.log(`\n=== findAndApplyHighlights 완료: ${successCount}/${savedHighlights.length} 성공 ===`);
}

async function loadHighlights() {
  const url = window.location.href;
  try {
    const data = await browser.storage.local.get([url, 'draftHighlights']);
    
    const savedHighlights = data[url] || [];
    const allDrafts = data.draftHighlights || [];
    
    const draftsForThisPage = allDrafts.filter(draft => draft.url === url);
    
    const officialHighlights = savedHighlights.filter(h => !draftsForThisPage.some(d => d.text === h.text));
    
    const highlightsToApply = [...officialHighlights, ...draftsForThisPage];
    
    setTimeout(() => {
      document.querySelectorAll('.highlighted-text').forEach(span => {
        if (span.parentNode) {
            span.replaceWith(...span.childNodes);
        }
      });
      document.querySelectorAll('.capsule-container, #tulip-menu, #memo-box').forEach(el => el.remove());

      findAndApplyHighlights(highlightsToApply);
    }, 1000);
  } catch (e) {
    console.error("하이라이트 로딩 중 오류 발생:", e);
  }
}

loadHighlights();


browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
  console.log("Received response: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received request: ", request);
});

window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    console.log('Page was loaded from bfcache. Reloading highlights.');
    loadHighlights();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Tab is now visible. Reloading highlights from local storage.');
    loadHighlights();
  }
});

document.addEventListener('click', function(event) {
    const tulipMenu = document.getElementById('tulip-menu');
    const memoBox = document.getElementById('memo-box');
    const clickedHighlight = event.target.closest('.highlighted-text');

    if (memoBox && !memoBox.contains(event.target) && !event.target.closest('.memo-capsule')) {
        closeMemoBox();
    }

    if (clickedHighlight) {
        if (tulipMenu && tulipMenu.dataset.highlightId === clickedHighlight.dataset.draftId) {
            return;
        }
        showTulipMenu(clickedHighlight);
        return;
    }

    if (tulipMenu) {
        tulipMenu.remove();
    }
});

function buildUnifiedText(clickedNode) {
  let container = clickedNode;

  // 문장 컨테이너 찾기 (최소 수정 → 기존 구조 유지)
  while (container && container !== document.body) {
    if (container.matches?.('span.article_p, p, div')) break;
    container = container.parentNode;
  }
  if (!container) container = document.body;

  // 모든 텍스트 노드 모으기
  const textNodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.trim().length > 0) textNodes.push(node);
  }

  // 하나의 문자열로 병합 + 매핑 정보 생성
  let fullText = '';
  const map = [];
  for (const tn of textNodes) {
    const start = fullText.length;
    const end = start + tn.textContent.length;
    map.push({ node: tn, start, end });
    fullText += tn.textContent;
  }

  return { fullText, map };
}
// 콘솔에서 직접 실행
browser.storage.local.get('draftHighlights').then(data => {
  const currentPageDrafts = data.draftHighlights.filter(d => d.url === window.location.href);
  console.log('현재 drafts:', currentPageDrafts);
  
  // 직접 하이라이트 적용 시도
  const saved = currentPageDrafts[0];
  console.log('찾을 텍스트:', saved.sentence);
  
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNode;
  let foundCount = 0;
  
  while (textNode = walker.nextNode()) {
    const index = textNode.textContent.indexOf(saved.sentence);
    if (index !== -1) {
      foundCount++;
      console.log(`발견 #${foundCount}:`, {
        nodeValue: textNode.textContent.substring(0, 100),
        parent: textNode.parentElement.tagName,
        parentClass: textNode.parentElement.className
      });
    }
  }
  
  console.log('총 발견 횟수:', foundCount);
});
