import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ak-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  public initials: string = '';

  @Input()
  public set name(value: string) {
    this.initials = value.split(" ").map(c => c.charAt(0)).join('');
  }

  constructor() { }

  ngOnInit(): void {
  }

}
