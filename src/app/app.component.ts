import { transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, map, tap, zip } from 'rxjs';
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
    this.filter$.subscribe((filter) => {
      console.log("filter changed");
      console.log(filter);
      this.filterTaskLists();
    })
  }

  public toggleMe() {

    this.filter$.next((c) => {
      return c.map((taskList: TaskList) => {
        taskList.tasks = taskList.tasks.filter(c => c.assigneeName == 'Alexander Panov');

        return taskList;
      });
    });
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
      this.filterTaskLists();
    })).subscribe();
  }

  public taskLists: TaskList[] = [];
  public filteredTaskLists: TaskList[] = [];

  public filter$: BehaviorSubject<(c: TaskList[]) => TaskList[]> = new BehaviorSubject<any>((c: TaskList[]) => c);

  public moveTask(event: any) {
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
  }

  public filterTaskLists() {
    this.filteredTaskLists = this.filter$.value(this.taskLists);
  }

  public search(event: any) {
    const query = ((event as HTMLInputElement).value);
    if (query == '') {
      this.filter$.next((c)=>c);
      return;
    }
    this.filter$.next((c: TaskList[]) => {
      const x = c.map((taskList: TaskList) => {
        return {...taskList, tasks: taskList.tasks.filter((c: Task) => (
          c.title.toLowerCase().indexOf(query.toLowerCase()) !== -1) ||
          c.shortDescription.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          c.assigneeName?.toLowerCase() == query.toLowerCase()
        )};
      });
      return x;
    });
  }
}

export type TaskList = { name: string, tasks: Task[], totalRemaining: number};