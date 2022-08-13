import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ak-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {

  @Input() name!: string;
  @Input() sublabel?: string;

  constructor() { }

  ngOnInit(): void {
  }

}
