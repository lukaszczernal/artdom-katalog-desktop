import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PagesService } from './pages.service';

import { moveItemInArray, CdkDropList, CdkDropListGroup, CdkDragMove, CdkDrag } from '@angular/cdk/drag-drop';
import { ViewportRuler } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(CdkDropListGroup, { static: true }) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList, { static: true }) placeholder: CdkDropList;

  public items: any[] = [];

  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public dragIndex: number;
  public activeContainer;

  public pagesStore: Observable<any>;

  private onDestroy: Subject<any> = new Subject();

  constructor(private viewportRuler: ViewportRuler, private readonly pagesService: PagesService) {
    this.target = null;
    this.source = null;
  }


  ngOnInit() {
    this.pagesService.getPages()
      .pipe(takeUntil(this.onDestroy))
      .subscribe(pages => {
        this.items = pages;
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  drop() {
    console.log('moved from', this.sourceIndex, 'to', this.targetIndex);
    moveItemInArray(this.items, this.sourceIndex, this.targetIndex);
    this.pagesService.setPages(this.items);
  }


  ngAfterViewInit() {
    const phElement = this.placeholder.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
  }

  // add() {
  //   this.items.push(this.items.length + 1);
  // }

  // shuffle() {
  //   this.items.sort(() => {
  //     return .5 - Math.random();
  //   });
  // }

  dragMoved(e: CdkDragMove) {
    const point = this.getPointerPositionOnPage(e.event);

    this.listGroup._items.forEach(dropList => {
      if (__isInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  dropListDropped() {
    if (!this.target) {
      return;
    }
    const phElement = this.placeholder.element.nativeElement;
    const parent = phElement.parentElement;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex !== this.targetIndex) {
      this.drop();
    }
  }

  dropListEnterPredicate = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop === this.placeholder) {
      return true;
    }

    if (drop !== this.activeContainer) {
      return false;
    }
    const phElement = this.placeholder.element.nativeElement;
    const sourceElement = drag.dropContainer.element.nativeElement;
    const dropElement = drop.element.nativeElement;

    const dragIndex = __indexOf(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    const dropIndex = __indexOf(dropElement.parentElement.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';

      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentElement.insertBefore(phElement, (dropIndex > dragIndex
      ? dropElement.nextSibling : dropElement));

    this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    return false;
  }

  /** Determines the point of the page that was touched by the user. */
  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = __isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();

    return {
      x: point.pageX - scrollPosition.left,
      y: point.pageY - scrollPosition.top
    };
  }
}

function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
}

/** Determines whether an event is a touch event. */
function __isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}

function __isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
  const { top, bottom, left, right } = dropList.element.nativeElement.getBoundingClientRect();
  return y >= top && y <= bottom && x >= left && x <= right;
}
