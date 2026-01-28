import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCteateComponent } from './course-cteate.component';

describe('CourseCteateComponent', () => {
  let component: CourseCteateComponent;
  let fixture: ComponentFixture<CourseCteateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCteateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourseCteateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
