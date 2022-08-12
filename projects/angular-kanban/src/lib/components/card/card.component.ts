import { Component, Input, OnInit } from '@angular/core';

export interface Card {
  tags?: string[];
  assignee: string;
  ticketId: string;
  description: string;
}

@Component({
  selector: 'ak-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() public ticketId?: string;

  constructor() { }

  ngOnInit(): void {
  }

}
