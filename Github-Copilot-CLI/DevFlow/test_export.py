#!/usr/bin/env python3
"""
Test script for DevFlow export functionality
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from src.exporter import AnalyticsExporter

def test_export():
    """Test export functionality"""
    print("DevFlow Export Test")
    print("=" * 50)
    
    try:
        # Initialize exporter
        print("\n1. Initializing exporter...")
        exporter = AnalyticsExporter()
        print(f"   Output directory: {exporter.output_dir}")
        
        # Create output directory
        exporter.output_dir.mkdir(parents=True, exist_ok=True)
        print(f"   ✓ Output directory created")
        
        # Test each export function
        print("\n2. Exporting productivity summary...")
        result = exporter.export_productivity_summary_json(days=7)
        print(f"   ✓ Exported {len(result.get('sparklineData', []))} sparkline data points")
        
        print("\n3. Exporting file hotspots...")
        result = exporter.export_file_hotspots_json(days=30, limit=10)
        print(f"   ✓ Exported {len(result.get('fileRiskData', []))} hotspot files")
        
        print("\n4. Exporting commit analytics...")
        result = exporter.export_commit_analytics_json(days=365)
        print(f"   ✓ Exported {len(result.get('heatmapData', []))} heatmap data points")
        
        print("\n5. Exporting command usage...")
        result = exporter.export_command_usage_json(limit=10)
        print(f"   ✓ Exported {len(result.get('commandData', []))} commands")
        
        print("\n6. Exporting insights...")
        result = exporter.export_insights_json(days=30)
        print(f"   ✓ Exported {len(result.get('insights', []))} insights")
        
        # List created files
        print("\n7. Files created:")
        files = [
            'productivity-summary.json',
            'file-hotspots.json',
            'commit-analytics.json',
            'command-usage.json',
            'insights.json'
        ]
        
        for file in files:
            file_path = exporter.output_dir / file
            if file_path.exists():
                size = file_path.stat().st_size
                print(f"   ✓ {file} ({size:,} bytes)")
            else:
                print(f"   ✗ {file} (NOT FOUND)")
        
        print("\n" + "=" * 50)
        print("✓ Export test completed successfully!")
        print(f"\nFiles are in: {exporter.output_dir}")
        
        return True
    
    except Exception as e:
        print(f"\n✗ Export test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_export()
    sys.exit(0 if success else 1)
