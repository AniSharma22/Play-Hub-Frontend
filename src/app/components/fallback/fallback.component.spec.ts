import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FallbackComponent } from './fallback.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('FallbackComponent', () => {
  let component: FallbackComponent;
  let fixture: ComponentFixture<FallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FallbackComponent, TestHostComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render ng-content inside the div with text-color-secondary class', () => {
    // Arrange: Create a test host component with projected content
    const testHostFixture = TestBed.createComponent(TestHostComponent);
    testHostFixture.detectChanges();

    // Act: Find the projected content using DebugElement
    const contentDiv = testHostFixture.debugElement.query(By.css('.text-color-secondary'));

    // Assert: Check if the content is correctly projected
    expect(contentDiv).toBeTruthy();
    expect(contentDiv.nativeElement.textContent.trim()).toBe('Projected content');
  });
});

@Component({
  template: `<app-fallback>Projected content</app-fallback>`
})
class TestHostComponent {}
