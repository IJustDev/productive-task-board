import { transferArrayItem } from '@angular/cdk/drag-drop';
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
      'Open',
      'In Progress',
      'Done'
    ];

    const taskListObservables = taskListNames.map(taskListName => {
      return this._productiveService.getTasks("filter[status][eq]=1&filter[task_list_name][eq]=" + taskListName).pipe(
        map((tasks: Task[]) => {
          return ({
            name: taskListName,
            tasks,
            totalRemaining: tasks.map(c => c.remainingTime).reduce((p, c) => p + (c < 0 ? 0 : c)),
          });
        })
      )
    });
    zip(taskListObservables).pipe(tap((taskLists) => {
      this.taskLists = taskLists;
    })).subscribe();
  }

  public taskLists: TaskList[] = [];

  public moveTask(event: any) {
    const item = event.item.data;
    const targetContainer = this.taskLists.find((c: any) => c.name == event.container.data);
    const sourceContainer = this.taskLists.find((c: any) => c.name == event.previousContainer.data);

    console.log(event)
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
  }
}

export type TaskList = { name: string, tasks: Task[], totalRemaining: number};