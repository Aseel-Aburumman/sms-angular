import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentCteateComponent } from './student-cteate.component';


describe('StudentCteateComponent', () => {
  let component: StudentCteateComponent;
  let fixture: ComponentFixture<StudentCteateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCteateComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StudentCteateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
