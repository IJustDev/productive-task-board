import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ak-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  @Input()
  public initials!: string;

  constructor() { }

  ngOnInit(): void {
  }

}
