/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { History } from 'history';
import { createMemoryHistory } from 'history';
import React, { memo } from 'react';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import { render as reactRender, act } from '@testing-library/react';

import { ScopedHistory } from '../../../../../src/core/public';
import { FleetAppContext } from '../applications/fleet/app';
import { IntegrationsAppContext } from '../applications/integrations/app';
import type { FleetConfigType } from '../plugin';
import type { UIExtensionsStorage } from '../types';

import { createConfigurationMock } from './plugin_configuration';
import { createStartMock } from './plugin_interfaces';
import { createStartServices } from './fleet_start_services';
import type { MockedFleetStart, MockedFleetStartServices } from './types';

type UiRender = (ui: React.ReactElement, options?: RenderOptions) => RenderResult;

/**
 * Test Renderer that includes mocked services and interfaces used during Fleet applicaiton rendering.
 * Any of the properties in this interface can be manipulated prior to `render()` if wanting to customize
 * the rendering context.
 */
export interface TestRenderer {
  /** History instance currently used by the Fleet UI Hash Router */
  history: History<any>;
  /** history instance provided to the Fleet plugin during application `mount()` */
  mountHistory: ScopedHistory;
  startServices: MockedFleetStartServices;
  config: FleetConfigType;
  /** The Interface returned by the Fleet plugin `start()` phase */
  startInterface: MockedFleetStart;
  kibanaVersion: string;
  AppWrapper: React.FC<any>;
  render: UiRender;
}

export const createFleetTestRendererMock = (): TestRenderer => {
  const basePath = '/mock';
  const extensions: UIExtensionsStorage = {};
  const startServices = createStartServices(basePath);
  const history = createMemoryHistory({ initialEntries: [basePath] });
  const testRendererMocks: TestRenderer = {
    history,
    mountHistory: new ScopedHistory(history, basePath),
    startServices,
    config: createConfigurationMock(),
    startInterface: createStartMock(extensions),
    kibanaVersion: '8.0.0',
    AppWrapper: memo(({ children }) => {
      return (
        <FleetAppContext
          basepath={basePath}
          startServices={testRendererMocks.startServices}
          config={testRendererMocks.config}
          history={testRendererMocks.mountHistory}
          kibanaVersion={testRendererMocks.kibanaVersion}
          extensions={extensions}
          routerHistory={testRendererMocks.history}
        >
          {children}
        </FleetAppContext>
      );
    }),
    render: (ui, options) => {
      let renderResponse: RenderResult;
      act(() => {
        renderResponse = reactRender(ui, {
          wrapper: testRendererMocks.AppWrapper,
          ...options,
        });
      });
      return renderResponse!;
    },
  };

  return testRendererMocks;
};

export const createIntegrationsTestRendererMock = (): TestRenderer => {
  const basePath = '/mock';
  const extensions: UIExtensionsStorage = {};
  const startServices = createStartServices(basePath);
  const testRendererMocks: TestRenderer = {
    history: createMemoryHistory(),
    mountHistory: new ScopedHistory(createMemoryHistory({ initialEntries: [basePath] }), basePath),
    startServices,
    config: createConfigurationMock(),
    startInterface: createStartMock(extensions),
    kibanaVersion: '8.0.0',
    AppWrapper: memo(({ children }) => {
      return (
        <IntegrationsAppContext
          basepath={basePath}
          startServices={testRendererMocks.startServices}
          config={testRendererMocks.config}
          history={testRendererMocks.mountHistory}
          kibanaVersion={testRendererMocks.kibanaVersion}
          extensions={extensions}
          routerHistory={testRendererMocks.history}
        >
          {children}
        </IntegrationsAppContext>
      );
    }),
    render: (ui, options) => {
      let renderResponse: RenderResult;
      act(() => {
        renderResponse = reactRender(ui, {
          wrapper: testRendererMocks.AppWrapper,
          ...options,
        });
      });
      return renderResponse!;
    },
  };

  return testRendererMocks;
};
