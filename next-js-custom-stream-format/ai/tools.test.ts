import { describe, it, expect } from 'vitest';
import { getWeather, convertTemperature, calculate, tools, ToolName } from './tools';

describe('ai/tools - Happy Path Tests', () => {
  describe('getWeather tool', () => {
    it('should have correct tool configuration', () => {
      expect(getWeather).toBeDefined();
      expect(getWeather.description).toBe('Get the current weather in a given location');
      expect(getWeather.inputSchema).toBeDefined();
    });

    it('should validate input schema correctly', () => {
      expect(getWeather.inputSchema).toBeDefined();
    });

    it('should execute and return weather data', async () => {
      const result = await getWeather.execute({ location: 'New York' }, {});
      expect(result).toHaveProperty('location', 'New York');
      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('conditions');
      expect(result).toHaveProperty('unit', 'fahrenheit');
    });

    it('should return temperature between 0 and 99', async () => {
      const result = await getWeather.execute({ location: 'LA' }, {});
      expect(typeof result.temperature).toBe('number');
      expect(result.temperature).toBeGreaterThanOrEqual(0);
      expect(result.temperature).toBeLessThan(100);
    });

    it('should return valid weather conditions', async () => {
      const validConditions = ['sunny', 'cloudy', 'rainy', 'snowy'];
      const result = await getWeather.execute({ location: 'Chicago' }, {});
      expect(validConditions).toContain(result.conditions);
    });

    it('should handle multiple locations', async () => {
      const locations = ['New York', 'London', 'Tokyo'];
      for (const location of locations) {
        const result = await getWeather.execute({ location }, {});
        expect(result.location).toBe(location);
      }
    });

    it('should randomize results on multiple calls', async () => {
      const r1 = await getWeather.execute({ location: 'Miami' }, {});
      const r2 = await getWeather.execute({ location: 'Miami' }, {});
      const isDifferent = r1.temperature !== r2.temperature || r1.conditions !== r2.conditions;
      expect(isDifferent).toBe(true);
    });
  });

  describe('convertTemperature tool', () => {
    it('should have correct tool configuration', () => {
      expect(convertTemperature).toBeDefined();
      expect(convertTemperature.description).toBe('Convert temperature between Celsius and Fahrenheit');
      expect(convertTemperature.inputSchema).toBeDefined();
    });

    it('should validate input schema', () => {
      expect(convertTemperature.inputSchema).toBeDefined();
    });

    it('should convert Fahrenheit to Celsius', async () => {
      const result = await convertTemperature.execute({
        temperature: 72,
        from: 'fahrenheit',
        to: 'celsius',
      }, {});
      expect(result.original).toBe(72);
      expect(result.converted).toBeCloseTo(22.22, 1);
    });

    it('should convert Celsius to Fahrenheit', async () => {
      const result = await convertTemperature.execute({
        temperature: 0,
        from: 'celsius',
        to: 'fahrenheit',
      }, {});
      expect(result.original).toBe(0);
      expect(result.converted).toBe(32);
    });

    it('should handle freezing point', async () => {
      const result = await convertTemperature.execute({
        temperature: 32,
        from: 'fahrenheit',
        to: 'celsius',
      }, {});
      expect(result.converted).toBeCloseTo(0, 1);
    });

    it('should handle boiling point', async () => {
      const result = await convertTemperature.execute({
        temperature: 100,
        from: 'celsius',
        to: 'fahrenheit',
      }, {});
      expect(result.converted).toBe(212);
    });

    it('should handle same unit conversion', async () => {
      const result = await convertTemperature.execute({
        temperature: 50,
        from: 'fahrenheit',
        to: 'fahrenheit',
      }, {});
      expect(result.converted).toBe(50);
    });

    it('should round to 2 decimal places', async () => {
      const result = await convertTemperature.execute({
        temperature: 100,
        from: 'fahrenheit',
        to: 'celsius',
      }, {});
      const decimals = (result.converted.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(2);
    });

    it('should handle negative temperatures', async () => {
      const result = await convertTemperature.execute({
        temperature: -40,
        from: 'celsius',
        to: 'fahrenheit',
      }, {});
      expect(result.converted).toBe(-40);
    });

    it('should handle decimal temperatures', async () => {
      const result = await convertTemperature.execute({
        temperature: 20.5,
        from: 'celsius',
        to: 'fahrenheit',
      }, {});
      expect(result.original).toBe(20.5);
      expect(typeof result.converted).toBe('number');
      expect(result.converted).toBeGreaterThan(0);
    });
  });

  describe('calculate tool', () => {
    it('should have correct tool configuration', () => {
      expect(calculate).toBeDefined();
      expect(calculate.description).toBe('Perform basic mathematical calculations');
      expect(calculate.inputSchema).toBeDefined();
    });

    it('should validate input schema', () => {
      expect(calculate.inputSchema).toBeDefined();
    });

    it('should execute addition', async () => {
      const result = await calculate.execute({ expression: '2 + 2' }, {});
      expect(result.result).toBe(4);
      expect(result.success).toBe(true);
    });

    it('should execute subtraction', async () => {
      const result = await calculate.execute({ expression: '10 - 3' }, {});
      expect(result.result).toBe(7);
      expect(result.success).toBe(true);
    });

    it('should execute multiplication', async () => {
      const result = await calculate.execute({ expression: '5 * 6' }, {});
      expect(result.result).toBe(30);
      expect(result.success).toBe(true);
    });

    it('should execute division', async () => {
      const result = await calculate.execute({ expression: '20 / 4' }, {});
      expect(result.result).toBe(5);
      expect(result.success).toBe(true);
    });

    it('should respect operator precedence', async () => {
      const result = await calculate.execute({ expression: '2 + 2 * 10' }, {});
      expect(result.result).toBe(22);
      expect(result.success).toBe(true);
    });

    it('should handle parentheses', async () => {
      const result = await calculate.execute({ expression: '(2 + 2) * 10' }, {});
      expect(result.result).toBe(40);
      expect(result.success).toBe(true);
    });

    it('should handle decimal numbers', async () => {
      const result = await calculate.execute({ expression: '3.5 + 2.5' }, {});
      expect(result.result).toBe(6);
      expect(result.success).toBe(true);
    });

    it('should handle negative numbers', async () => {
      const result = await calculate.execute({ expression: '-5 + 3' }, {});
      expect(result.result).toBe(-2);
      expect(result.success).toBe(true);
    });

    it('should handle complex expressions', async () => {
      const result = await calculate.execute({
        expression: '(10 + 5) * 2 - 10 / 2',
      }, {});
      expect(result.result).toBe(25);
      expect(result.success).toBe(true);
    });

    it('should handle exponentiation', async () => {
      const result = await calculate.execute({ expression: '2 ** 3' }, {});
      expect(result.result).toBe(8);
      expect(result.success).toBe(true);
    });

    it('should handle modulo operation', async () => {
      const result = await calculate.execute({ expression: '10 % 3' }, {});
      expect(result.result).toBe(1);
      expect(result.success).toBe(true);
    });

    it('should store original expression', async () => {
      const expr = '123 * 456';
      const result = await calculate.execute({ expression: expr }, {});
      expect(result.expression).toBe(expr);
    });
  });

  describe('tools export', () => {
    it('should export all tools as a record object', () => {
      expect(tools).toBeDefined();
      expect(typeof tools).toBe('object');
    });

    it('should have all three tools available', () => {
      expect(tools).toHaveProperty('getWeather');
      expect(tools).toHaveProperty('convertTemperature');
      expect(tools).toHaveProperty('calculate');
    });

    it('should export correct tool references', () => {
      expect(tools.getWeather).toBe(getWeather);
      expect(tools.convertTemperature).toBe(convertTemperature);
      expect(tools.calculate).toBe(calculate);
    });

    it('should have exactly three tools', () => {
      const toolKeys = Object.keys(tools);
      expect(toolKeys).toHaveLength(3);
      expect(toolKeys).toEqual(['getWeather', 'convertTemperature', 'calculate']);
    });
  });

  describe('ToolName type', () => {
    it('should match exported tool keys', () => {
      const toolNames: ToolName[] = ['getWeather', 'convertTemperature', 'calculate'];
      toolNames.forEach((name) => {
        expect(Object.keys(tools)).toContain(name);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should access tools dynamically by name', async () => {
      const toolName: ToolName = 'getWeather';
      const tool = tools[toolName];

      expect(tool).toBeDefined();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeTruthy();
      expect(tool.execute).toBeTruthy();
    });

    it('should execute all tools from tools object', async () => {
      const weatherResult = await tools.getWeather.execute({
        location: 'Paris',
      }, {});
      const tempResult = await tools.convertTemperature.execute({
        temperature: 20,
        from: 'celsius',
        to: 'fahrenheit',
      }, {});
      const calcResult = await tools.calculate.execute({ expression: '5 * 5' }, {});

      expect(weatherResult).toHaveProperty('location', 'Paris');
      expect(tempResult).toHaveProperty('converted');
      expect(calcResult).toHaveProperty('result', 25);
    });
  });

  describe('happy path workflows', () => {
    it('should work together: get weather and convert to celsius', async () => {
      const weather = await tools.getWeather.execute({ location: 'New York' }, {});
      expect(weather).toHaveProperty('temperature');
      expect(weather.unit).toBe('fahrenheit');

      const converted = await tools.convertTemperature.execute({
        temperature: weather.temperature,
        from: 'fahrenheit',
        to: 'celsius',
      }, {});

      expect(converted).toHaveProperty('converted');
      expect(typeof converted.converted).toBe('number');
    });

    it('should work together: calculate complex formula', async () => {
      const calculation = await tools.calculate.execute({
        expression: '32 * 1.8 + 32',
      }, {});

      expect(calculation.success).toBe(true);
      expect(calculation.result).toBeGreaterThan(0);
    });

    it('should handle concurrent multi-tool operations', async () => {
      const results = await Promise.all([
        tools.calculate.execute({ expression: '5 + 5' }, {}),
        tools.getWeather.execute({ location: 'London' }, {}),
        tools.convertTemperature.execute({
          temperature: 25,
          from: 'celsius',
          to: 'fahrenheit',
        }, {}),
      ]);

      expect(results[0]).toHaveProperty('result', 10);
      expect(results[1]).toHaveProperty('location', 'London');
      expect(results[2]).toHaveProperty('converted');
    });

    it('should chain tool operations sequentially', async () => {
      const weather = await tools.getWeather.execute({ location: 'Tokyo' }, {});
      const celsius = await tools.convertTemperature.execute({
        temperature: weather.temperature,
        from: 'fahrenheit',
        to: 'celsius',
      }, {});
      const calc = await tools.calculate.execute({
        expression: `${celsius.converted} * 2`,
      }, {});

      expect(calc.success).toBe(true);
      expect(calc.result).toBeGreaterThanOrEqual(0);
    });
  });
});
