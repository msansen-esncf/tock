import {Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {AnswerContainer, Media, SimpleAnswer, SimpleAnswerConfiguration} from "../model/story";
import {BotService} from "../bot-service";
import {MatDialog, MatSnackBar} from "@angular/material";
import {StateService} from "../../core-nlp/state.service";
import {CreateI18nLabelRequest} from "../model/i18n";
import {MediaDialogComponent} from "./media/media-dialog.component";
import {AnswerController} from "./controller";

@Component({
  selector: 'tock-simple-answer',
  templateUrl: './simple-answer.component.html',
  styleUrls: ['./simple-answer.component.css']
})
export class SimpleAnswerComponent implements OnInit {

  @Input()
  container: AnswerContainer;

  @Input()
  answerLabel: string = "Answer";

  @Input()
  submit: AnswerController = new AnswerController();

  answer: SimpleAnswerConfiguration;

  fullDisplay: boolean;
  newAnswer: string;
  newMedia: Media;

  @ViewChild('newAnswerElement') newAnswerElement: ElementRef;

  constructor(private state: StateService,
              private bot: BotService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.answer = this.container.simpleAnswer();
    this.answer.allowNoAnswer = this.container.allowNoAnwser();
    setTimeout(_ => this.newAnswerElement.nativeElement.focus(), 500);
    const _this = this;
    this.submit.answerSubmitListener = callback => _this.addAnswerIfNonEmpty(callback);
  }

  toggleDisplay() {
    this.fullDisplay = !this.fullDisplay;
  }

  updateLabel(answer: SimpleAnswer) {
    this.bot
      .saveI18nLabel(answer.label)
      .subscribe(_ => this.snackBar.open(`Label updated`, "Update", {duration: 3000}));
  }

  private addAnswerIfNonEmpty(callback) {
    if (this && this.newAnswer && this.newAnswer.trim().length !== 0) {
      this.addAnswer(callback);
    } else {
      callback();
    }
  }

  addAnswer(callback?) {
    if (!this.newAnswer || this.newAnswer.trim().length === 0) {
      this.newAnswer = "";
      if (!this.container.allowNoAnwser() && this.answer.answers.length === 0) {
        this.snackBar.open("Please specify an answer", "Error", {duration: 5000})
      } else {
        this.submit.submitAnswer();
      }
    } else {
      this.bot.createI18nLabel(
        new CreateI18nLabelRequest(
          this.container.category,
          this.newAnswer.trim(),
          this.state.currentLocale,
        )
      ).subscribe(i18n => {
        this.answer.answers.push(
          new SimpleAnswer(
            i18n,
            -1,
            this.newMedia
          ));
        this.newAnswer = "";
        this.newMedia = null;
        if (callback) {
          callback();
        }
      });
    }
  }

  deleteAnswer(answer: SimpleAnswer, notify: boolean = false) {
    this.answer.answers.splice(this.answer.answers.indexOf(answer), 1);
    this.bot.deleteI18nLabel(answer.label).subscribe(c => {
      if (notify) this.snackBar.open(`Label deleted`, "DELETE", {duration: 1000})
    });
  }

  displayMediaMessage(answer?: SimpleAnswer) {
    const media = answer ? answer.mediaMessage : this.newMedia;
    let dialogRef = this.dialog.open(
      MediaDialogComponent,
      {
        data:
          {
            media: media,
            category: this.container.category
          }
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      const removeMedia = result.removeMedia;
      const media = result.media;
      if (removeMedia || media) {
        if (removeMedia) {
          if (answer) answer.mediaMessage = null; else this.newMedia = null;
        } else {
          if (answer) answer.mediaMessage = media; else this.newMedia = media;
        }
      }
    });
  }

}
