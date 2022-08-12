import { Component, OnInit } from '@angular/core';
import { Card } from 'projects/angular-kanban/src/public-api';
import { ProductiveService, Task } from './productive.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-kanban-workspace';

  constructor(private _productiveService: ProductiveService) {}

  ngOnInit() {
    this._productiveService.getTasks().subscribe((tasks) => {
      this.tasks = tasks;
    });
  }

  tasks: Task[] = [];
}
