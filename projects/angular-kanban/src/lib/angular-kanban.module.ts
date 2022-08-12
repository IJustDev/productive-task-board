import { NgModule } from '@angular/core';
import { CardComponent } from './components/card/card.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ActionButtonComponent } from './components/action-button/action-button.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TagComponent } from './components/tag/tag.component';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './components/board/board.component';

@NgModule({
  declarations: [
    CardComponent,
    UserProfileComponent,
    ActionButtonComponent,
    TaskListComponent,
    TagComponent,
    BoardComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    CardComponent,
    UserProfileComponent,
    TagComponent,
    TaskListComponent,
    BoardComponent
  ]
})
export class AngularKanbanModule { }
