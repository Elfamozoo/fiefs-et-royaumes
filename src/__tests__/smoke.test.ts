import { describe, it, expect } from 'vitest';
import { ENGINE_VERSION } from '@engine/index';
import { App } from '@ui/index';

describe('Scaffolding Smoke Test', () => {
  it('resolves @engine path alias cleanly', () => {
    expect(ENGINE_VERSION).toBe('0.1.0');
  });

  it('resolves @ui path alias cleanly', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });

  it('executes assertions deterministically', () => {
    const actionPointsPerMonth = 10;
    const maxActionPoints = 40;
    expect(actionPointsPerMonth).toBe(10);
    expect(maxActionPoints).toBe(40);
  });
});
