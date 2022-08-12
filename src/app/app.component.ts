import { Component, OnInit } from '@angular/core';
import { map, tap, zip } from 'rxjs';
import { ProductiveService, Task } from './productive.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-kanban-workspace';

  constructor(private _productiveService: ProductiveService) { }

  ngOnInit() {
    this.getTaskLists();
  }

  public getTaskLists() {
    const taskListNames = [
      'OPEN',
      'IN PROGRESS',
      'DONE'
    ];

    const taskListObservables = taskListNames.map(taskListName => {
      return this._productiveService.getTasks("filter[status][eq]=1&filter[task_list_name][eq]=" + taskListName).pipe(
        map((tasks: Task[]) => {
          return ({
            name: taskListName,
            tasks,
            totalRemaining: tasks.map(c => c.remainingTime).reduce((p, c) => p + c),
          });
        })
      )
    });
    zip(taskListObservables).pipe(tap((taskLists) => {
      this.taskLists = taskLists;
    })).subscribe();
  }

  public taskLists: TaskList[] = [];
}

export type TaskList = { name: string, tasks: Task[], totalRemaining: number};